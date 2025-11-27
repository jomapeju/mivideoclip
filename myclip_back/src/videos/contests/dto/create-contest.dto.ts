import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ContestStatus } from '../../entities/contest.entity';

export class CreateContestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus;
}
