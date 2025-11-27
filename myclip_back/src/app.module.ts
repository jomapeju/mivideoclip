/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VideosModule } from './videos/videos.module';
import { ContestsModule } from './videos/contests/contests.module';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST, // Usará 'db' (el nombre del servicio Docker)
      //port: parseInt(process.env.DB_PORT, 10) || 5432,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      //username: 'portal_user',
      //password: '123456789',
      //database: 'videoclip_db',
      // La clave para mapear las tablas:
      entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
      // En desarrollo, TypeORM intentará sincronizar la estructura.
      // ¡ADVERTENCIA! Usar 'true' en producción puede ser peligroso.
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    VideosModule,
    ContestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    // Asegúrate de que las variables de entorno se están cargando
    console.log('Database Configuration:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
  }
}
