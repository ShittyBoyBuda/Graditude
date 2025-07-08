import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleCalendarServiceService } from './google-calendar-service.service';
import { GoogleCalendarServiceController } from './google-calendar-service.controller';
import { CourseworkService } from 'src/coursework/coursework.service';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';
import { Tag } from 'src/Entities/Tag.entity';
import { CalendarEvent } from 'src/Entities/CalendarEvent.entity';
import { CourseWork } from 'src/Entities/courseWork.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, Student, Tag, CalendarEvent, CourseWork])
  ],
  providers: [GoogleCalendarServiceService, CourseworkService],
  controllers: [GoogleCalendarServiceController]
})
export class GoogleCalendarServiceModule {}
