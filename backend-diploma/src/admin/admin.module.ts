import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/Entities/admin.entity';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, CourseWork, Teacher, Student]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h'}, 
      })
    })],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
