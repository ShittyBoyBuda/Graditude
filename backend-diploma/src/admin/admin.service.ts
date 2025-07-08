import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/Entities/admin.entity';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';
import * as ExcelJS from 'exceljs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(CourseWork)
    private courseWorkRepository: Repository<CourseWork>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private jwtService: JwtService,
  ) {}

  // Метод для создания (регистрации) админа
  async createAdmin(email: string, password: string): Promise<Admin> {
    const existing = await this.adminRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Admin with this email already exists');
    }
    const hash = await bcrypt.hash(password, 10);
    const admin = this.adminRepository.create({
      email,
      password: hash,
      role: 'admin',
    });
    return this.adminRepository.save(admin);
  }

  // Валидация админа по email и паролю
  async validateAdmin(email: string, password: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (!admin) {
      throw new BadRequestException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }
    return admin;
  }

  // Логин админа: возвращает JWT токен
  async loginAdmin(email: string, password: string): Promise<{ access_token: string }> {
    const admin = await this.validateAdmin(email, password);
    const payload = { email: admin.email, sub: admin.id, role: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Экспорт всех данных (курсовые, преподаватели, студенты) в один Excel-файл
  async exportAllDataToExcel(): Promise<Buffer> {
    const courseworks = await this.courseWorkRepository.find({
      relations: ['teacher', 'student', 'tags'],
    });
    const teachers = await this.teacherRepository.find();
    const students = await this.studentRepository.find({ relations: ['teacher'] });

    const workbook = new ExcelJS.Workbook();

    // Лист с курсовыми работами
    const cwSheet = workbook.addWorksheet('Курсовые работы');
    cwSheet.columns = [
      { header: 'Название', key: 'title', width: 50 },
      { header: 'Преподаватель', key: 'teacher', width: 30 },
      { header: 'Студент', key: 'student', width: 30 },
    ];
    cwSheet.views = [{ state: 'frozen', ySplit: 1 }];
    const cwHeader = cwSheet.getRow(1);
    cwHeader.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0070C0' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    courseworks.forEach((cw) => {
      cwSheet.addRow({
        title: cw.title,
        description: cw.description,
        student: cw.student
          ? `${cw.student.lastName} ${cw.student.firstName}`
          : 'Нет',
        teacher: cw.teacher
          ? `${cw.teacher.lastName} ${cw.teacher.firstName}`
          : 'Нет',
      });
    });

    // Лист с преподавателями
    const teacherSheet = workbook.addWorksheet('Преподаватели');
    teacherSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Имя', key: 'firstName', width: 20 },
      { header: 'Фамилия', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
    ];
    teacherSheet.views = [{ state: 'frozen', ySplit: 1 }];
    const teacherHeader = teacherSheet.getRow(1);
    teacherHeader.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0070C0' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    teachers.forEach((teacher) => {
      teacherSheet.addRow({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
      });
    });

    // Лист со студентами
    const studentSheet = workbook.addWorksheet('Студенты');
    studentSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Имя', key: 'firstName', width: 20 },
      { header: 'Фамилия', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Преподаватель', key: 'teacher', width: 30 },
    ];
    studentSheet.views = [{ state: 'frozen', ySplit: 1 }];
    const studentHeader = studentSheet.getRow(1);
    studentHeader.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0070C0' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    students.forEach((student) => {
      studentSheet.addRow({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        teacher: student.teacher
          ? `${student.teacher.lastName} ${student.teacher.firstName}`
          : 'Нет',
      });
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(excelBuffer);
  }
}
