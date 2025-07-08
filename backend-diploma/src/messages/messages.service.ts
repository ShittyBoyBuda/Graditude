import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatGroup } from 'src/Entities/chatGroup.entity';
import { GroupMessage } from 'src/Entities/grouptMessage.entity';
import { Message } from 'src/Entities/message.entity';
import { Student } from 'src/Entities/student.entity';
import { Teacher } from 'src/Entities/teacher.entity';
import { In, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private messageRepo: Repository<Message>,
        @InjectRepository(ChatGroup)
        private chatGroupRepo: Repository<ChatGroup>,
        @InjectRepository(GroupMessage)
        private groupMessageRepo: Repository<GroupMessage>,
        @InjectRepository(Student)
        private studentRepo: Repository<Student>,
        @InjectRepository(Teacher)
        private teacherRepo: Repository<Teacher>,
        private chatGateway: ChatGateway,
    ) {}

    async getPrivateMessages(userId: number, role: 'student' | 'teacher') {
        const where = [];

        if (role === 'student') {
            where.push(
                { senderStudent: { id: userId } },
                { receiverStudent: { id: userId } }
            );
        } else {
            where.push(
                { senderTeacher: { id: userId } },
                { receiverTeacher: { id: userId } }
            );
        }
        

        return this.messageRepo.find({
            where,
            relations: [
                'senderStudent',
                'senderTeacher',
                'receiverStudent',
                'receiverTeacher',
            ],
            order: { createdAt: 'DESC' }
        });
    }

    async sendPrivateMessage(
        dto: CreateMessageDto,
        senderId: number,
        role: 'student' | 'teacher'
      ) {
        let senderStudent: Student;
        let senderTeacher: Teacher;
        
        // Исправленные строки:
        if (role === 'student') {
          senderStudent = await this.studentRepo.findOneOrFail({ 
            where: { id: senderId } 
          });
        } else {
          senderTeacher = await this.teacherRepo.findOneOrFail({ 
            where: { id: senderId } 
          });
        }
      
        // Исправление для получателя
        const receiver = dto.receiverRole === 'student' 
          ? { 
            receiverStudent: await this.studentRepo.findOneOrFail({ 
                where: { id: dto.receiverId } 
              }) 
            }
          : { 
            receiverTeacher: await this.teacherRepo.findOneOrFail({ 
                where: { id: dto.receiverId } 
              }) 
            };
      
        // Проверка прав студента (добавить where)
        if (role === 'student' && dto.receiverRole === 'teacher') {
          const student = await this.studentRepo.findOne({
            where: { id: senderId },
            relations: ['courseWork', 'courseWork.teacher']
          });
          
          if (student?.courseWork?.teacher.id !== dto.receiverId) {
            throw new ForbiddenException('Нет доступа к этому преподавателю');
          }
        }
      
        const message = await this.messageRepo.save({
            content: dto.content,
            senderStudent,
            senderTeacher,
            ...receiver,
        });
        
        // Отправляем сообщение через WebSocket
        this.chatGateway.server.emit('receiveMessage', message);
        
        return message;
    }

    async createGroup(dto: CreateGroupDto, teacherId: number) {
        const teacher = await this.teacherRepo.findOneOrFail({
            where: { id: teacherId }
        });

        const students = await this.studentRepo.find({
            where: { id: In(dto.studentIds) },
            relations: ['courseWork', 'courseWork.teacher']
        });

        const invalidStudents = students.filter(s => 
            s.courseWork?.teacher.id !== teacherId
        );

        if (invalidStudents.length > 0) {
            throw new ForbiddenException('Некоторые студенты не ваши');
        }

        return this.chatGroupRepo.save({
            name: dto.name,
            teacher,
            students
        });
    }

    async sendGroupMessage(
        groupId: number,
        dto: CreateGroupMessageDto,
        senderId: number,
        role: 'student' | 'teacher'
    ) {
        const group = await this.chatGroupRepo.findOne({
            where: { id: groupId },
            relations: ['students', 'teacher']
        });

        if (!group) {
            throw new NotFoundException('Группа не найдена');
        }

        if (role === 'student') {
            const isMember = group.students.some(s => s.id === senderId);
            if (!isMember) {
                throw new ForbiddenException('Вы не в этой группе');
            }
        } else {
            if (group.teacher.id !== senderId) {
                throw new ForbiddenException('Вы не владелец группы');
            }
        }

        const sender = role === 'student'
            ? {
                senderStudent: await this.studentRepo.findOneOrFail({
                    where: { id: senderId }
                })
            }
            : {
                senderTeacher: await this.teacherRepo.findOneOrFail({
                    where: { id: senderId }
                })
            };

            const message = await this.groupMessageRepo.save({
                content: dto.content,
                ...sender,
                chatGroup: group,
            });
  
             // Отправляем групповое сообщение через WebSocket
            this.chatGateway.server.emit(`groupMessage`, message);
            
            return message;
    }

    async getUserGroups(userId: number, role: 'student' | 'teacher') {
        if (role === 'teacher') {
          return this.chatGroupRepo.find({
            where: { teacher: { id: userId } },
            relations: ['students', 'teacher', 'messages', 'messages.senderStudent', 'messages.senderTeacher'],
          });
        } else {
          return this.chatGroupRepo.createQueryBuilder('group')
            .innerJoin('group.students', 'student')
            .where('student.id = :userId', { userId })
            .leftJoinAndSelect('group.students', 'students')
            .leftJoinAndSelect('group.teacher', 'teacher')
            .leftJoinAndSelect('group.messages', 'messages') // Добавляем связь с сообщениями
            .leftJoinAndSelect('messages.senderStudent', 'senderStudent') // Добавляем отправителя-студента
            .leftJoinAndSelect('messages.senderTeacher', 'senderTeacher')
            .getMany();
        }
    }

    async getGroupMessages(groupId: number, userId: number, role: 'student' | 'teacher') {
        const group = await this.chatGroupRepo.findOne({
            where: { id: groupId },
            relations: ['students', 'teacher']
        });
    
        if (!group) {
            throw new NotFoundException('Группа не найдена');
        }
    
        if (role === 'student') {
            const isMember = group.students.some(s => s.id === userId);
            if (!isMember) {
                throw new ForbiddenException('Вы не состоите в этой группе');
            }
        } else if (group.teacher.id !== userId) {
            throw new ForbiddenException('Вы не являетесь владельцем группы');
        }
    
        return this.groupMessageRepo.find({
            where: { chatGroup: { id: groupId } },
            relations: ['senderStudent', 'senderTeacher'],
            order: { createdAt: 'DESC' }
        });
    }

    async deleteGroupChat(groupId: number, teacherId: number) {
        const group = await this.chatGroupRepo.findOne({
            where: { id: groupId },
            relations: ['teacher'],
        });
    
        if (!group) {
            throw new NotFoundException('Группа не найдена');
        }
    
        if (group.teacher.id !== teacherId) {
            throw new ForbiddenException('Вы не являетесь владельцем группы');
        }
    
        await this.groupMessageRepo.delete({ chatGroup: { id: groupId } }); // Удаляем сообщения группы
        await this.chatGroupRepo.delete(groupId); // Удаляем саму группу
    
    }
    
    
}
