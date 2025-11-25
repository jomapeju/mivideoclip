import { IsString, IsNotEmpty } from 'class-validator';

export class CreateVideoDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  songTitle: string;
}