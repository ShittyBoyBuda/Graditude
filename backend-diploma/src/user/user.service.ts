import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) {}

    async getTeacherByEmail(email :string): Promise<Teacher> {
        const teacher = this.teacherRepository.findOne({ where: { email: email } });
        if (!teacher) throw new NotFoundException('Преподаватель не найден');
        return teacher;
    }

    async getStudentByEmail(email :string): Promise<Omit<Student, 'password'>> {
        const student = this.studentRepository.findOne({ where: { email: email } });
        if (!student) throw new NotFoundException('Студент не найден');
        return student;
    }
}
