/* eslint-disable */
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Put,
  Delete,
} from '@nestjs/common';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UpdateContestDto } from './dto/update-contest.dto';
import { VoteContestDto } from './dto/vote-contest.dto';


@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateContestDto) {
    return this.contestsService.create(dto);
  }

  @Get()
  findAll() {
    return this.contestsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contestsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContestDto) {
    return this.contestsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contestsService.remove(id);
  }

  // =========================
  //   5. INSCRIPCIÓN DE VÍDEOS
  // =========================

  /**
   * Inscribir un vídeo (del usuario logueado) en un concurso
   * POST /api/v1/contests/:contestId/submit
   * Body: { "videoId": "uuid" }
   */
  @UseGuards(JwtAuthGuard)
  @Post(':contestId/submit')
  @HttpCode(HttpStatus.CREATED)
  async submitVideo(
    @Param('contestId') contestId: string,
    @Body() body: { videoId?: string },
    @Request() req,
  ) {
    if (!body.videoId) {
      throw new BadRequestException('videoId es obligatorio');
    }

    const userId = req.user?.user_id || req.user?.id || req.user?.sub;

    const submission = await this.contestsService.submitVideoToContest(
      contestId,
      body.videoId,
      userId,
    );

    return {
      message: 'Vídeo inscrito correctamente en el concurso',
      submission,
    };
  }

  /**
   * Listar todos los vídeos inscritos en un concurso
   * GET /api/v1/contests/:contestId/videos
   */
  @Get(':contestId/videos')
  async listSubmissions(@Param('contestId') contestId: string) {
    return this.contestsService.listSubmissions(contestId);
  }

  /**
   * (Opcional) Listar solo los vídeos del usuario logueado en este concurso
   * GET /api/v1/contests/:contestId/my-videos
   */
  @UseGuards(JwtAuthGuard)
  @Get(':contestId/my-videos')
  async mySubmissions(
    @Param('contestId') contestId: string,
    @Request() req,
  ) {
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    return this.contestsService.listUserSubmissions(contestId, userId);
  }

  // =========================
  //   6. VOTACIONES POR CONCURSO
  // =========================

  /**
   * Votar en un concurso por un vídeo concreto
   * POST /api/v1/contests/:contestId/vote
   * Body: { "videoId": "uuid" }
   */
  @UseGuards(JwtAuthGuard)
  @Post(':contestId/vote')
  @HttpCode(HttpStatus.CREATED)
  async vote(
    @Param('contestId') contestId: string,
    @Body() dto: VoteContestDto,
    @Request() req,
  ) {
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;

    const vote = await this.contestsService.voteInContest(
      contestId,
      dto.videoId,
      userId,
    );

    return {
      message: 'Voto registrado correctamente',
      vote,
    };
  }

  /**
   * Ranking público del concurso
   * GET /api/v1/contests/:contestId/ranking
   */
  @Get(':contestId/ranking')
  async ranking(@Param('contestId') contestId: string) {
    return this.contestsService.getContestRanking(contestId);
  }
}
