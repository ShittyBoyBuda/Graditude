import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { CourseWork } from 'src/Entities/courseWork.entity'; 
import { Student } from 'src/Entities/student.entity';
import { Progress } from 'src/Entities/progress.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Teacher } from 'src/Entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseWork, Student, Progress, Teacher]),
  AuthModule,
  ServeStaticModule.forRoot({
    rootPath: join(process.cwd(), 'uploads'),
    serveRoot: '/uploads',
  })],
  providers: [ProgressService],
  controllers: [ProgressController]
})
export class ProgressModule {}
