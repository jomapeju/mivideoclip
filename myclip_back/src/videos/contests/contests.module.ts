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

@Module({
  imports: [TypeOrmModule.forFeature([Contest, ContestVideo, ContestVote, Video]), AuthModule],
  controllers: [ContestsController],
  providers: [ContestsService],
  exports: [ContestsService],
})
export class ContestsModule {}
