// backend/src/videos/dto/create-comment.dto.ts

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    content: string;
    
    // El videoId se obtendrá del parámetro de ruta.
}