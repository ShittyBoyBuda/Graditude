import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
        @InjectRepository(Student) private studentRepository: Repository<Student>,
        private jwtService: JwtService,
    ) {}

    async registerTeacher(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
        const { password, ...teacherData} = createTeacherDto;
        const hashedPassword = await bcrypt.hash(createTeacherDto.password, 10);
        const teacher = this.teacherRepository.create({
            ...teacherData,
            password: hashedPassword,
        });
        return this.teacherRepository.save(teacher);
    }

    async registerStudent(createStudentDto: CreateStudentDto): Promise<Student> {
        const { password, ...studentData} = createStudentDto;
        const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);
        const student = this.studentRepository.create({
            ...studentData,
            password: hashedPassword,
        });
        return this.studentRepository.save(student);
    }

    async validateTeacher (loginUserDto: LoginUserDto): Promise<Omit<Teacher, 'password'>> {
        const teacher = await this.teacherRepository.findOne({ 
            where: { email: loginUserDto.email },
            relations: ['students', 'courseWorks']
        });

        if (!teacher) {
            throw new UnauthorizedException('Пользователь c таким email не найден');
        }

        const isPasswordValid = await bcrypt.compare(loginUserDto.password, teacher.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Неправильный пароль');
        }

        const occupiedSlots = teacher.students.length;
        const availableSlots = teacher.totalSlots - occupiedSlots;
        
        const { password, ...result } = teacher;
        return {
            ...result,
            occupiedSlots,
            availableSlots,
        };
    }

    async validateStudent (loginUserDto: LoginUserDto): Promise<Omit<Student, 'password'>> {
        const student = await this.studentRepository.findOne({ where: { email: loginUserDto.email }});

        if (!student) {
            throw new UnauthorizedException('Пользователь c таким email не найден');
        }

        const isPasswordValid = await bcrypt.compare(loginUserDto.password, student.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Неправильный пароль');
        }
        
        const { password, ...result } = student;
        return result;
    }

    async loginTeacher(loginUserDto: LoginUserDto) {
        const teacher = await this.validateTeacher(loginUserDto);

        const payload = { email: teacher.email, sub: teacher.id, role: 'teacher' };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async loginStudent(loginUserDto: LoginUserDto) {
        const student = await this.validateStudent(loginUserDto);

        const payload = { email: student.email, sub: student.id, role: 'student'};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
