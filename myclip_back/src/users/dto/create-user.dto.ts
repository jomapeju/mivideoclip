// DTO: Define los datos que esperamos recibir del cliente
export class CreateUserDto {
  username: string;
  email: string;
  password: string; // La contraseña sin hashear, tal como la envía el usuario
}
