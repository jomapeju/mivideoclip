/* eslint-disable */
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator'; 
// Asegúrate de tener todos estos imports

export class CreateUserDto {
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
  username: string;
  
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @IsString({ message: 'El token debe ser una cadena de texto.' })
  @IsOptional({ message: 'El token es obligatorio.' })
  recaptchaToken: string;

}
