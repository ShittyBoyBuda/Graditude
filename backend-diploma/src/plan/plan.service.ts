import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from 'src/Entities/plan.entity';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { CreatePlanDto } from './dto/CreatePlanDto.dto';

@Injectable()
export class PlanService {
    constructor(
        @InjectRepository(Plan)
        private planRepository: Repository<Plan>,
        @InjectRepository(CourseWork)
        private courseWorkRepository: Repository<CourseWork>,
    ) {}

    async createPlan(courseWorkId: number, dto: CreatePlanDto, userId: number, role: string): Promise<Plan> {
      const courseWork = await this.courseWorkRepository.findOne({
        where: { id: courseWorkId },
        relations: ['teacher'], // Важно для проверки прав
      });
        if (!courseWork) throw new NotFoundException('Курсовая не найдена');

        if (role === 'teacher' && courseWork.teacher.id !== userId) {
          throw new ForbiddenException('Нет доступа к этой курсовой работе');
        }

        const plan = this.planRepository.create({
            structure: dto.structure,
            courseWork
        });

        return this.planRepository.save(plan);
    }

    async getPlan(courseWorkId: number, userId: number, role: string): Promise<Plan> {
        const courseWork = await this.courseWorkRepository.findOne({
            where: { id: courseWorkId },
            relations: ['teacher', 'student'],
          });

          if (!courseWork) throw new NotFoundException('Курсовая работа не найдена');

          if (role === 'teacher' && courseWork.teacher.id !== userId) {
            throw new ForbiddenException('Нет доступа к этой курсовой работе');
          }

          if (role === 'student' && courseWork.student?.id !== userId) {
            throw new ForbiddenException('Нет доступа к этой курсовой работе');
          }

          return this.planRepository.findOne({
            where: { courseWork: { id: courseWorkId } },
          })
    }

    async updatePlan(courseWorkId: number, dto: CreatePlanDto, userId: number, role: string): Promise<Plan> {
      const courseWork = await this.courseWorkRepository.findOne({
        where: { id: courseWorkId },
        relations: ['teacher', 'student', 'plans'], // Загружаем план, преподавателя и студента
      });

      if (!courseWork) {
        throw new NotFoundException('Курсовая работа не найдена');
      }
    
      // Проверка прав преподавателя
      if (role === 'teacher' && courseWork.teacher.id !== userId) {
        throw new ForbiddenException('Нет прав для редактирования плана этой курсовой работы');
      }
    
      // Проверка прав студента (если нужно)
      if (role === 'student' && courseWork.student.id !== userId) {
        throw new ForbiddenException('Нет прав для редактирования плана этой курсовой работы');
      }

        // Если план не существует, создаем его
      if (!courseWork.plans) {
        const newPlan = this.planRepository.create({
          structure: dto.structure,
          courseWork,
        });
        return this.planRepository.save(newPlan);
      }

      courseWork.plans.structure = dto.structure;

      return this.planRepository.save(courseWork.plans);
    }
}
