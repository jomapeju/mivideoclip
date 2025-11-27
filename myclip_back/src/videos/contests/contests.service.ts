/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contest, ContestStatus } from '../entities/contest.entity';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';

@Injectable()
export class ContestsService {
  constructor(
    @InjectRepository(Contest)
    private readonly contestsRepo: Repository<Contest>,
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
}
