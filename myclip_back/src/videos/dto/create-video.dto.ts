/* eslint-disable */
import { 
    IsString, 
    IsNotEmpty, 
    IsOptional, 
    MaxLength,
    IsArray,      // <-- Nuevo
    IsUUID,       // <-- Nuevo
    ArrayMaxSize, // <-- Nuevo
    ArrayMinSize  // <-- Nuevo
} from 'class-validator';
import { VideoVisibility } from '../entities/video.entity';

export class CreateVideoDto {
    @IsString()
    @IsNotEmpty({ message: 'El título del video es obligatorio.' })
    @MaxLength(255)
    title: string;

    @IsString()
    @IsNotEmpty({ message: 'El título de la canción es obligatorio.' })
    @MaxLength(255)
    songTitle: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsArray({ message: 'Las categorías deben ser un arreglo.' })
    @ArrayMinSize(1, { message: 'Se requiere al menos una categoría.' })
    @ArrayMaxSize(4, { message: 'El máximo permitido es de 4 categorías por video.' })
    @IsUUID('4', { each: true, message: 'Cada ID de categoría debe ser un UUID válido.' })
    categoryIds: string[];

    @IsString()
    visibility: VideoVisibility;;

}