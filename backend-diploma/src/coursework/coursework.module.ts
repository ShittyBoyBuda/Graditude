import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseworkController } from './coursework.controller';
import { CourseworkService } from './coursework.service';
import { CourseWork } from 'src/Entities/courseWork.entity'; 
import { Teacher } from 'src/Entities/teacher.entity'; 
import { Student } from 'src/Entities/student.entity';
import { Tag } from 'src/Entities/Tag.entity';
import { Plan } from 'src/Entities/plan.entity';
import { Task } from 'src/Entities/task.entity';
import { CalendarEvent } from 'src/Entities/CalendarEvent.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleCalendarServiceService } from 'src/google-calendar-service/google-calendar-service.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseWork, Teacher, Student, Tag, Plan, Task, CalendarEvent]),
    AuthModule 
  ],
  controllers: [CourseworkController],
  providers: [CourseworkService, GoogleCalendarServiceService],
})
export class CourseworkModule {}
