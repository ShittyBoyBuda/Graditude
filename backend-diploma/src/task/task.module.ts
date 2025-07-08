import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Task } from 'src/Entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, CourseWork]),
    AuthModule
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {}
