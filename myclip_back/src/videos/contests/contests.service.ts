/* eslint-disable */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Contest,
  ContestStatus,
} from '../entities/contest.entity';
import { ContestVideo } from '../entities/contest-video.entity';
import { Video } from '../entities/video.entity';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { ContestVote } from '../entities/contest-vote.entity';
import { VideoVisibility } from '../entities/video.entity';

@Injectable()
export class ContestsService {
  constructor(
    @InjectRepository(Contest)
    private readonly contestsRepo: Repository<Contest>,

    @InjectRepository(ContestVideo)
    private readonly contestVideosRepo: Repository<ContestVideo>,

    @InjectRepository(ContestVote)
    private readonly contestVotesRepo: Repository<ContestVote>,

    @InjectRepository(Video)
    private readonly videosRepo: Repository<Video>,
  ) {}

  async create(dto: CreateContestDto): Promise<Contest> {
    const start = new Date(dto.start_date);
    const end = new Date(dto.end_date);

    if (start >= end) {
      throw new BadRequestException('La fecha de inicio debe ser anterior al final.');
    }

    const contest = this.contestsRepo.create({
      title: dto.title,
      description: dto.description,
      start_date: start,
      end_date: end,
      status: dto.status ?? ContestStatus.UPCOMING,
    });

    return await this.contestsRepo.save(contest);
  }

  async findAll(): Promise<Contest[]> {
    return this.contestsRepo.find({
      order: { start_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contest> {
    const contest = await this.contestsRepo.findOne({ where: { contest_id: id } });
    if (!contest) throw new NotFoundException('Concurso no encontrado');
    return contest;
  }

  async update(id: string, dto: UpdateContestDto): Promise<Contest> {
    const contest = await this.findOne(id);

    if (dto.start_date) contest.start_date = new Date(dto.start_date);
    if (dto.end_date) contest.end_date = new Date(dto.end_date);

    if (contest.end_date <= contest.start_date) {
      throw new BadRequestException('La fecha de finalización debe ser posterior a la de inicio');
    }

    Object.assign(contest, dto);
    return this.contestsRepo.save(contest);
  }

  async remove(id: string): Promise<void> {
    const contest = await this.findOne(id);
    await this.contestsRepo.remove(contest);
  }

  // =========================
  //   5. INSCRIPCIÓN DE VÍDEOS
  // =========================

  /**
   * Inscribir un vídeo del usuario en un concurso
   */
  async submitVideoToContest(
    contestId: string,
    videoId: string,
    userId: string,
  ): Promise<ContestVideo> {
    // 1) Verificar concurso
    const contest = await this.contestsRepo.findOne({
      where: { contest_id: contestId },
    });
    if (!contest) {
      throw new NotFoundException('Concurso no encontrado');
    }

    const now = new Date();
    if (contest.status !== ContestStatus.ACTIVE) {
      throw new BadRequestException('El concurso no está activo');
    }
    if (now < contest.start_date || now > contest.end_date) {
      throw new BadRequestException(
        'El concurso no está dentro de las fechas de participación',
      );
    }

    // 2) Verificar vídeo y que sea del usuario
    const video = await this.videosRepo.findOne({
      where: { video_id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Vídeo no encontrado');
    }

    if (video.visibility === VideoVisibility.PRIVATE) {
      throw new BadRequestException('No puedes inscribir un video privado en un concurso.');
    }


    if (video.user_id !== userId) {
      throw new ForbiddenException(
        'Solo puedes inscribir vídeos que te pertenecen',
      );
    }

    // 3) Evitar duplicados (mismo vídeo en mismo concurso)
    const existing = await this.contestVideosRepo.findOne({
      where: {
        contestId: contestId,
        videoId: videoId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Este vídeo ya está inscrito en este concurso',
      );
    }

    // 4) Límite por usuario (si existe)
    if (contest.maxVideosPerUser && contest.maxVideosPerUser > 0) {
      const count = await this.contestVideosRepo
        .createQueryBuilder('cv')
        .innerJoin(Video, 'v', 'v.video_id = cv.videoId')
        .where('cv.contestId = :contestId', { contestId })
        .andWhere('v.user_id = :userId', { userId })
        .getCount();

      if (count >= contest.maxVideosPerUser) {
        throw new ForbiddenException(
          `Has alcanzado el máximo de ${contest.maxVideosPerUser} vídeos permitidos en este concurso`,
        );
      }
    }

    // 5) Crear inscripción
    const submission = this.contestVideosRepo.create({
      contestId,
      videoId,
    });

    return await this.contestVideosRepo.save(submission);
  }

  /**
   * Listar todos los vídeos inscritos en un concurso
   * (incluye datos del vídeo y del usuario)
   */
  async listSubmissions(contestId: string): Promise<ContestVideo[]> {
    const contest = await this.contestsRepo.findOne({
      where: { contest_id: contestId },
    });
    if (!contest) {
      throw new NotFoundException('Concurso no encontrado');
    }

    return this.contestVideosRepo.find({
      where: { contestId },
      relations: ['video', 'video.user'],
      order: { createdAt: 'ASC' },
    }).then(list => list.filter(sub => sub.video.visibility === VideoVisibility.PUBLIC));

  }

  /**
   * (Opcional) Lista solo los vídeos de un usuario en un concurso
   */
  async listUserSubmissions(
    contestId: string,
    userId: string,
  ): Promise<ContestVideo[]> {
    return this.contestVideosRepo
      .createQueryBuilder('cv')
      .innerJoinAndSelect('cv.video', 'v')
      .innerJoinAndSelect('v.user', 'u')
      .where('cv.contestId = :contestId', { contestId })
      .andWhere('v.user_id = :userId', { userId })
      .orderBy('cv.createdAt', 'ASC')
      .getMany();
  }

  // =========================
  //   6. VOTACIONES POR CONCURSO
  // =========================

  /**
   * Registrar un voto en un concurso.
   * Regla: 1 voto por usuario y concurso (no puede cambiar de vídeo).
   */
  async voteInContest(
    contestId: string,
    videoId: string,
    userId: string,
  ): Promise<ContestVote> {
    // 1) Validar concurso
    const contest = await this.contestsRepo.findOne({
      where: { contest_id: contestId },
    });
    if (!contest) {
      throw new NotFoundException('Concurso no encontrado');
    }

    const now = new Date();
    if (contest.status !== ContestStatus.ACTIVE) {
      throw new BadRequestException('El concurso no está activo');
    }
    if (now < contest.start_date || now > contest.end_date) {
      throw new BadRequestException(
        'El concurso no está dentro de las fechas de votación',
      );
    }

    // 2) Validar que el vídeo existe y está inscrito en el concurso
    const submission = await this.contestVideosRepo.findOne({
      where: { contestId, videoId },
      relations: ['video'],
    });
    if (!submission) {
      throw new BadRequestException(
        'Este vídeo no está inscrito en el concurso',
      );
    }

    // 3) Comprobar si el usuario ya ha votado en este concurso
    const existingVote = await this.contestVotesRepo.findOne({
      where: { contestId, userId },
    });

    if (existingVote) {
      // Regla simple: NO se puede cambiar el voto
      throw new ConflictException(
        'Ya has votado en este concurso (solo se permite un voto por usuario)',
      );

      // Si quisieras permitir cambiar de vídeo:
      // existingVote.videoId = videoId;
      // return await this.contestVotesRepo.save(existingVote);
    }

    // 4) Crear voto
    const vote = this.contestVotesRepo.create({
      contestId,
      userId,
      videoId,
    });

    return await this.contestVotesRepo.save(vote);
  }

  /**
   * Ranking en tiempo (casi) real del concurso:
   * Lista de vídeos inscritos + nº de votos
   */
  async getContestRanking(
    contestId: string,
  ): Promise<
    { submissionId: string; video: Video; votes: number }[]
  > {
    // Verificar que el concurso existe
    const contest = await this.contestsRepo.findOne({
      where: { contest_id: contestId },
    });
    if (!contest) {
      throw new NotFoundException('Concurso no encontrado');
    }

    const qb = this.contestVideosRepo
      .createQueryBuilder('cv')
      .innerJoinAndSelect('cv.video', 'video')
      .leftJoin(
        ContestVote,
        'vote',
        'vote.contestId = cv.contestId AND vote.videoId = cv.videoId',
      )
      .where('cv.contestId = :contestId', { contestId })
      .andWhere('video.visibility = :vis', { vis: VideoVisibility.PUBLIC })      
      .groupBy('cv.id')
      .addGroupBy('video.video_id')
      .orderBy('COUNT(vote.id)', 'DESC')
      .addOrderBy('cv.createdAt', 'ASC')
      .addSelect('COUNT(vote.id)', 'votes');

    const { raw, entities } = await qb.getRawAndEntities();

    return entities.map((cv, index) => ({
      submissionId: cv.id,
      video: cv.video,
      votes: Number(raw[index].votes),
    }));
  }

}
