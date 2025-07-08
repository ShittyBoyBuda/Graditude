import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/Entities/task.entity';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { CreateTaskDto } from './dto/CreateTaskDto.dto';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        @InjectRepository(CourseWork)
        private courseWorkRepository: Repository<CourseWork>,
    ) {}

    async createTask(courseWorkId: number, dto:CreateTaskDto, userId: number, role: string): Promise<Task> {
      const courseWork = await this.courseWorkRepository.findOne({
        where: { id: courseWorkId },
        relations: ['teacher', 'student'], // Добавляем связь с преподавателем и студентом
      });
      
      if (!courseWork) throw new NotFoundException('Курсовая не найдена');

      if (role === 'teacher' && courseWork.teacher.id !== userId) {
        throw new ForbiddenException('Нет прав для создания задач в этой курсовой работе');
      }

      if (role === 'student' && courseWork.student.id !== userId) {
        throw new ForbiddenException('Нет прав для создания задач в этой курсовой работе');
      }

        const task = this.taskRepository.create({
            ...dto,
            courseWork
        });

        return this.taskRepository.save(task);
    }

    async updateTask(taskId: number, dto: Partial<CreateTaskDto>): Promise<Task> {
        const task = await this.taskRepository.findOneBy({ id: taskId });
        if (!task) throw new NotFoundException('Задача не найдена');

        return this.taskRepository.save({ ...task, ...dto });
    }

    async getTask(courseWorkId: number, userId: number, role: string): Promise<Task[]> {
        const courseWork = await this.courseWorkRepository.findOne({
            where: { id: courseWorkId },
            relations: ['teacher', 'student'],
          });

          if (!courseWork) throw new NotFoundException('Курсовая не найдена');

          // Проверка прав для преподавателя
          if (role === 'teacher' && courseWork.teacher.id !== userId) {
            throw new ForbiddenException('Нет доступа к этой курсовой работе');
          }
        
          // Проверка прав для студента
          if (role === 'student' && courseWork.student?.id !== userId) {
            throw new ForbiddenException('Нет доступа к этой курсовой работе');
          }

          return this.taskRepository.find({
            where: { courseWork: { id: courseWorkId } },
            order: { id: 'ASC'}
          });
    }

    async deleteTask(courseWorkId: number, taskId: number, userId: number, role: string): Promise<void> {
      const courseWork = await this.courseWorkRepository.findOne({
        where: { id: courseWorkId },
        relations: ['teacher', 'student'],
      });

      if (!courseWork) throw new NotFoundException('Курсовая не найдена');

      // Проверка прав для преподавателя
      if (role === 'teacher' && courseWork.teacher.id !== userId) {
        throw new ForbiddenException('Нет доступа к этой курсовой работе');
      }
    
      // Проверка прав для студента
      if (role === 'student' && courseWork.student?.id !== userId) {
        throw new ForbiddenException('Нет доступа к этой курсовой работе');
      }
      
      const task = await this.taskRepository.findOne({ 
        where: { id: taskId, courseWork: { id: courseWorkId } }
      });

      if (!task) {
        throw new NotFoundException('Задача не найдена');
      }

      await this.taskRepository.remove(task);

    }

}
