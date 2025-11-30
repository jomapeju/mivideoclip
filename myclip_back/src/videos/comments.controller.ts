/* eslint-disable */
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CommentRateLimitGuard } from "../common/rate-limit/comment-rate-limit.guard";

// Helper centralizado para sacar el userId del req.user
function getUserIdFromRequest(req: any): string | null {
  return (
    req.user?.user_id || // por si en algún sitio lo devolvieras así
    req.user?.id ||      // lo que devuelve tu JwtStrategy actualmente
    req.user?.userId ||  // por si en el futuro cambias el payload
    req.user?.sub ||     // típico en JWT estándar
    null
  );
}

@Controller("videos/:videoId/comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getAll(@Param("videoId") videoId: string) {
    return this.commentsService.getCommentsTree(videoId);
  }

  @UseGuards(JwtAuthGuard, CommentRateLimitGuard)
  @Post()
  async create(
    @Param("videoId") videoId: string,
    @Request() req,
    @Body() dto: CreateCommentDto,
  ) {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      // Si por lo que sea el guard pasó pero no hay userId, cortamos aquí
      throw new UnauthorizedException("Usuario no autenticado");
    }

    return this.commentsService.create(videoId, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":commentId/react")
  async react(
    @Param("commentId") commentId: string,
    @Request() req,
    @Body("value") value: 1 | -1,
  ) {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      throw new UnauthorizedException("Usuario no autenticado");
    }

    return this.commentsService.react(commentId, userId, value);
  }
}
