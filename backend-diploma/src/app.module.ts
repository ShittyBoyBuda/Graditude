import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Teacher } from './Entities/teacher.entity';
import { Student } from './Entities/student.entity';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { Progress } from './Entities/progress.entity';
import { Tag } from './Entities/Tag.entity';
import { Plan } from './Entities/plan.entity';
import { Task } from './Entities/task.entity';
import { Admin } from './Entities/admin.entity';
import { CourseworkModule } from './coursework/coursework.module';
import { ProgressModule } from './progress/progress.module';
import { TeacherModule } from './teacher/teacher.module';
import { UserModule } from './user/user.module';
import { PlanModule } from './plan/plan.module';
import { TaskModule } from './task/task.module';
import { MessagesModule } from './messages/messages.module';
import { GroupMessage } from './Entities/grouptMessage.entity';
import { ChatGroup } from './Entities/chatGroup.entity';
import { Message } from './Entities/message.entity';
import { ChatGateway } from './chat/chat.gateway';
import { AdminModule } from './admin/admin.module';
import { GoogleCalendarServiceModule } from './google-calendar-service/google-calendar-service.module';
import { CalendarEvent } from './Entities/CalendarEvent.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [Teacher, Student, CourseWork, Progress, Tag, Plan, Task, GroupMessage, ChatGroup, Message, Admin, CalendarEvent],
        synchronize: true,
      }),
    }),
    AuthModule,
    CourseworkModule,
    ProgressModule,
    TeacherModule,
    UserModule,
    PlanModule,
    TaskModule,
    MessagesModule,
    AdminModule,
    GoogleCalendarServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
