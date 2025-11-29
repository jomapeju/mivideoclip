/* eslint-disable */
// myclip_back/src/videos/contests/contests.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';
import { Contest } from '../entities/contest.entity';
import { ContestVideo } from '../entities/contest-video.entity';
import { Video } from '../entities/video.entity';
import { AuthModule } from '../../auth/auth.module';
import { ContestVote } from '../entities/contest-vote.entity';
import { RateLimitService } from '../../common/rate-limit/rate-limit.service';
import { ContestVoteGuard } from '../../common/rate-limit/contest-vote.guard';
import { ContestSubmitGuard } from '../../common/rate-limit/contest-submit.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Contest, ContestVideo, ContestVote, Video]), AuthModule],
  controllers: [ContestsController],
  providers: [ContestsService,
    ContestsService,
    RateLimitService,
    ContestVoteGuard,
    ContestSubmitGuard,
  ],
  exports: [ContestsService],
})
export class ContestsModule {}
