// DTO: Define los datos de texto que acompañan al archivo de video
export class CreateVideoDto {
    title: string;
    description: string;
    songTitle: string;
    // user_id lo obtendremos del JWT, no del Body.
}