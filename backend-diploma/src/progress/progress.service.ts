import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from 'src/Entities/progress.entity';
import { Student } from 'src/Entities/student.entity';
import { Teacher } from 'src/Entities/teacher.entity';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { CreateProgressDto } from './dto/create-progress.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private progressRepository: Repository<Progress>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        @InjectRepository(CourseWork)
        private courseWorkRepository: Repository<CourseWork>,
        @InjectRepository(Teacher)
        private teacherRepository: Repository<Teacher>,
    ) {}

    async createProgress(createProgressDto: CreateProgressDto, courseWorkId: number, userId: number, role: string): Promise<Progress> {
        const courseWork = await this.courseWorkRepository.findOne({ where: { id: courseWorkId }, relations: ['student'] });
        
        if (!courseWork) {
            throw new NotFoundException('Курсовая работа не найдена');
        }

        if (role === 'student') {
            const student = await this.studentRepository.findOne({
                where: { id: userId },
                relations: ['courseWork']
            });

            if (!student || student.courseWork.id !== courseWork.id) {
                throw new NotFoundException('Студент не принадлежит к этому курсовому проекту');
            }

            const progress = this.progressRepository.create({
                ...createProgressDto,
                courseWork: { id: courseWorkId },
                student: { id: student.id },
            });
            return this.progressRepository.save(progress);

        } else if (role === 'teacher') {
            const teacher = await this.teacherRepository.findOne({
                where: { id: userId },
                relations: ['courseWorks'],
            });

            if (!teacher || !teacher.courseWorks.some(cw => cw.id === courseWorkId)) {
                throw new NotFoundException('Курсовая работа не принадлежит этому учителю');
            }

            const progress = this.progressRepository.create({
                ...createProgressDto,
                courseWork: { id: courseWorkId },
                student: { id: courseWork.student.id },
            });
            return this.progressRepository.save(progress);


        } else {
            throw new ForbiddenException('У вас нет доступа к этому курсовому проекту');
        }
    }

    async getProgressByCourseWork(courseWorkId: number, userId: number, role: string): Promise<Progress[]> {
        const progresses = await this.progressRepository.find({
            where: { courseWork: { id: courseWorkId } },
            relations: ['student'],
        });
        const courseWork = await this.courseWorkRepository.findOne({
            where: { id: courseWorkId },
            relations: ['teacher'],
        });
    
        if (!courseWork) {
            throw new NotFoundException('Курсовая работа не найдена');
        }
    
        if (role === 'student') {
            const student = await this.studentRepository.findOne({
                where: { id: userId },
                relations: ['courseWork'],
            });
    
            if (!student || student.courseWork.id !== courseWork.id) {
                throw new NotFoundException('Студент не принадлежит к этому курсовому проекту');
            }
        } else if (role === 'teacher') {
            const teacher = await this.teacherRepository.findOne({
                where: { id: userId },
                relations: ['courseWorks'],
            });
    
            if (!teacher || !teacher.courseWorks.some(cw => cw.id === courseWorkId)) {
                throw new NotFoundException('Курсовая работа не принадлежит этому учителю');
            }
        } else {
            throw new ForbiddenException('У вас нет доступа к этому курсовому проекту');
        }
    
        if (!progresses || progresses.length === 0) {
            throw new NotFoundException('Прогресс не найден');
        }
    
        return progresses;
    }

    async deleteProgress(progressId: number, userId: number, role: string): Promise<void> {
        const progress = await this.progressRepository.findOne({
            where: { id: progressId },
            relations: ['courseWork', 'courseWork.teacher', 'courseWork.student'],
        });

        if (!progress.courseWork) {
            throw new NotFoundException('Курсовая работа не найдена для этого прогресса');
        }

        if (role === 'teacher') {
            if (!progress.courseWork.teacher) {
                throw new NotFoundException('Преподаватель не найден для курсовой работы');
            }
            
            if (progress.courseWork.teacher.id !== userId) {
                throw new ForbiddenException('Нет доступа к этой курсовой работе');
            }
        }

        if (role === 'student') {
            if (!progress.courseWork.student) {
                throw new NotFoundException('Студент не найден для курсовой работы');
            }
            
            if (progress.courseWork.student.id !== userId) {
                throw new ForbiddenException('Нет доступа к этой курсовой работе');
            }
        }

        if (progress.fileLink) {
            try {
                const filePath = path.join(
                    process.cwd(),
                    progress.fileLink.startsWith('/uploads')
                        ? progress.fileLink.slice(1)
                        : progress.fileLink
                );

                await fs.unlink(filePath);
            } catch (err: any) {
                console.error('Ошибка удаления файла: ', err);
            }
        }

        await this.progressRepository.remove(progress);
    }
    
}
