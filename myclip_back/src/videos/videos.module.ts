/* eslint-disable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video } from './entities/video.entity';
import { AuthModule } from '../auth/auth.module'; // Necesario para el guardián
import { User } from '../users/entities/user.entity/user.entity';
import { Vote } from './entities/vote.entity';
import { Comment } from './entities/comment.entity';
import { Category } from './entities/category.entity';
import { Contest } from './entities/contest.entity';
import { ContestVideo } from './entities/contest-video.entity';
import { ContestVote } from './entities/contest-vote.entity';
import { VideoMetrics } from './entities/video-metrics.entity';
import { CategoryVideoStats } from './entities/category-video-stats.entity';
import { ContestsModule } from './contests/contests.module';
import { RateLimitService } from '../common/rate-limit/rate-limit.service';
import { CommentRateLimitGuard } from '../common/rate-limit/comment-rate-limit.guard';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Video, 
      User,
      Vote, 
      Comment,
      Category,
      Contest,
      ContestVideo,
      ContestVote,
      VideoMetrics,
      CategoryVideoStats,
    ]),
    AuthModule, // Importar AuthModule para usar JwtAuthGuard
    ContestsModule
  ],
  controllers: [VideosController],
  providers: [VideosService,
    RateLimitService,
    CommentRateLimitGuard,
  ],
})
export class VideosModule {}