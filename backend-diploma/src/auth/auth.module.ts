import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';
import { JwtStrategy } from './jwt.strategy';
import { TeacherService } from 'src/teacher/teacher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Student]),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '24h'}, 
    })
  })],
  providers: [AuthService, JwtStrategy, TeacherService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
