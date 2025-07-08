import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGroup } from 'src/Entities/chatGroup.entity';
import { GroupMessage } from 'src/Entities/grouptMessage.entity';
import { Message } from 'src/Entities/message.entity';
import { Student } from 'src/Entities/student.entity';
import { Teacher } from 'src/Entities/teacher.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ChatGateway } from 'src/chat/chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatGroup, GroupMessage, Message, Student, Teacher]),
    AuthModule
  ],
  providers: [MessagesService, ChatGateway],
  controllers: [MessagesController]
})
export class MessagesModule {}
