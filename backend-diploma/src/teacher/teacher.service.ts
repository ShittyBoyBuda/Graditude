import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';
import { TeacherDto } from './dto/TeacherDto.dto';
import { StudentDto } from './dto/StudentDto.dto';

@Injectable()
export class TeacherService {
    constructor(
        @InjectRepository(Teacher)
        private teacherRepository: Repository<Teacher>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
    ) {}

    async getAllTeachers(): Promise<TeacherDto[]> {
        const teachers = await this.teacherRepository.find({
            relations: ['courseWorks', 'students'],
        });

        return teachers.map((teacher) => new TeacherDto(teacher));
    }

    async getAllStudents(teacherId: number): Promise<StudentDto[]> {
        const students = await this.studentRepository.find({
            relations: ['courseWork', 'courseWork.teacher'],
            where: {
                courseWork: {
                    teacher: {
                        id: teacherId,
                    },
                },
            },
        });

        return students.map((student) => new StudentDto(student));
    }

    async updateTeacherSlots(teacherId: number, totalSlots: number): Promise<Teacher> {
        const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

        if (!teacher) {
            throw new NotFoundException('Преподаватель не найдет');
        }

        if (totalSlots < 0) {
            throw new BadRequestException('Количество слотов не может быть отрицательным');
        }

        teacher.totalSlots = totalSlots;

        await this.teacherRepository.save(teacher);

        return teacher;
    }

    async updateTeacherGoogleToken(teacherId: number, refreshToken: string): Promise<Teacher> {
        const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
        if (!teacher) {
          throw new NotFoundException('Преподаватель не найден');
        }
        teacher.googleRefreshToken = refreshToken;
        return await this.teacherRepository.save(teacher);
      }
      
}
