/* eslint-disable */
import { IsUUID, IsNotEmpty } from 'class-validator';

export class VoteContestDto {
  @IsUUID()
  @IsNotEmpty()
  videoId: string;
}