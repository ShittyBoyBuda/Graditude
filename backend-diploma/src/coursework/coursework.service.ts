import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { Repository } from 'typeorm';
import { CreateCourseworkDto } from './dto/create-coursework.dto';
import { UpdateCourseworkDto } from './dto/update-coursework.dto';
import { SelectCourseWorkDto } from './dto/select-coursework.dto';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';
import { Tag } from 'src/Entities/Tag.entity';
import { CourseWorkDto } from './dto/courseWorkDto.dto';
import * as ExcelJs from 'exceljs';
import { CalendarEvent, DeadlineType } from 'src/Entities/CalendarEvent.entity';
import { GoogleCalendarServiceService } from 'src/google-calendar-service/google-calendar-service.service';
import { CreateCalendarEventDto } from 'src/google-calendar-service/dto/createCalendarEvent.dto';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class CourseworkService {
    constructor(
        @InjectRepository(CourseWork)
        private courseWorkRepository: Repository<CourseWork>,
        @InjectRepository(Teacher)
        private teacherRepository: Repository<Teacher>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
        @InjectRepository(CalendarEvent)
        private calendarEventRepository: Repository<CalendarEvent>,
        private googleCalendarService: GoogleCalendarServiceService,
        private configService: ConfigService,
    ) {}

    async createCourseWork(createCourseWorkDto: CreateCourseworkDto, teacherId: number): Promise<CourseWork> {
        const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

        if (!teacher) {
            throw new NotFoundException ('Преподаватель не найден');
        }

        const { tags } = createCourseWorkDto;
        const tagEntities = await Promise.all(
            tags.map(async (name) => {
                let tag = await this.tagRepository.findOne({ where: { name } });
                if (!tag) {
                    tag = this.tagRepository.create({ name });
                    await this.tagRepository.save(tag);
                }
                return tag;
            })
        );

        const coursework = this.courseWorkRepository.create({
            ...createCourseWorkDto,
            teacher,
            tags: tagEntities,
            isAvailable: true,
        });

        return this.courseWorkRepository.save(coursework);
    }

    async getAllCourseworks(): Promise<CourseWorkDto[]> {
        const courseWorks = await this.courseWorkRepository.find({ relations: ['teacher', 'tags', 'teacher.students'] });
        return courseWorks.map((courseWork) => new CourseWorkDto(courseWork));
    }

    async findCourseWorkByTeacher(teacherId: number): Promise<CourseWork[]> {
        const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });

        if (!teacher) {
            throw new NotFoundException ('Преподаватель не найден');
        }

        return this.courseWorkRepository.find({ where: { teacher: {id: teacherId} }, relations: ['teacher', 'student', 'tags', 'plans', 'tasks'] });
    }

    async findCourseWorkByStudent(studentId: number): Promise<CourseWork[]> {
        const student = await this.studentRepository.findOne({ where: { id: studentId } });

        if (!student) {
            throw new NotFoundException ('Ученик не найден');
        }

        return this.courseWorkRepository.find({ where: { student: { id: studentId } }, relations: ['teacher', 'plans', 'tasks', 'tags'] });
    }

    async updateCourseWork(courseWorkId: number, teacherId: number, updateCourseWorkDto: UpdateCourseworkDto): Promise<CourseWork> {
        const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
        const coursework = await this.courseWorkRepository.findOne({ where: { id: courseWorkId }, relations: ['teacher', 'tags'] });

        if (!teacher) {
            throw new NotFoundException('Преподаватель не найден');
        }

        if (!coursework) {
            throw new NotFoundException('Работа не найдена');
        }

        if (teacher.id !== coursework.teacher.id) {
            throw new ForbiddenException('Работа не принадлежит этому преподавателю');
        }

        if (updateCourseWorkDto.tags) {
            const tagEntities = await Promise.all(
                updateCourseWorkDto.tags.map(async (tagName) => {
                    let tag = await this.tagRepository.findOne({ where: { name: tagName } });
                    if (!tag) {
                        tag = this.tagRepository.create({ name: tagName });
                        await this.tagRepository.save(tag);
                    }
                    return tag;
                }),
            );

            coursework.tags = tagEntities;
        }

        Object.assign(coursework, {...updateCourseWorkDto, tags: coursework.tags });

        return this.courseWorkRepository.save(coursework);
    }

    async deleteCourseWork(courseWorkId: number, teacherId: number): Promise<void> {
        const coursework = await this.courseWorkRepository.findOne({ where: { id: courseWorkId, teacher: { id: teacherId } } });

        if (!coursework) {
            throw new NotFoundException('Работа не найдена или не принадлежит этому учителю');
        }

        await this.courseWorkRepository.remove(coursework);
    }

    async selectCourseWork(selectCourseWorkDto: SelectCourseWorkDto, studentId: number): Promise<CourseWork> {
        const courseWork = await this.courseWorkRepository.findOne({
            where: { id: selectCourseWorkDto.courseWorkId },
            relations: ['student', 'teacher']
        });

        if (!courseWork) {
            throw new NotFoundException('Работа не найдена');
        }

        if (!courseWork.isAvailable) {
            throw new BadRequestException('Тема уже занята');
        }

        const teacher = courseWork.teacher;
        if (teacher.availableSlots <= 0) {
            throw new BadRequestException('У данного преподавателя нет свободных мест');
        }

        const currentCourseWork = await this.courseWorkRepository.findOne({
            where: { student: { id: studentId } },
        });

        if (currentCourseWork) {
            currentCourseWork.isAvailable = true;
            currentCourseWork.student = null;
            await this.courseWorkRepository.save(currentCourseWork);
        }

        courseWork.student = { id: studentId } as Student;
        courseWork.isAvailable = false;

        await this.courseWorkRepository.save(courseWork);

        await this.studentRepository.update(studentId, { teacher: courseWork.teacher });

        return courseWork;

    };

    async exportCourseworksToExcel(teacherId: number): Promise<Buffer> {
        const courseworks = await this.findCourseWorkByTeacher(teacherId);
      
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Курсовые работы');
      
        worksheet.columns = [
          { header: 'Название', key: 'title', width: 50 },
          { header: 'Описание', key: 'description', width: 50 },
          { header: 'Студент', key: 'student', width: 30 },
        ];
      
        // Фиксируем первую строку (заголовки)
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      
        // Применяем стили для заголовков
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Жирный белый шрифт
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0070C0' }, // Синяя заливка
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      
        // Добавляем данные по курсовым работам
        courseworks.forEach(coursework => {
          worksheet.addRow({
            title: coursework.title,
            description: coursework.description,
            student: coursework.student
              ? `${coursework.student.lastName} ${coursework.student.firstName}`
              : 'Нет',
          });
        });
      
        // Применяем границы для всех заполненных строк
        worksheet.eachRow({ includeEmpty: false }, (row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        });
      
        const excelBuffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(excelBuffer);
      }

      async addCalendarEvent(
        courseWorkId: number,
        createCalendarEventDto: CreateCalendarEventDto,
      ): Promise<CalendarEvent> {
        const courseWork = await this.courseWorkRepository.findOne({
          where: { id: courseWorkId },
          relations: ['teacher'],
        });
        if (!courseWork) {
          throw new NotFoundException('Курсовая работа не найдена');
        }
        const teacher = courseWork.teacher;
        if (!teacher.googleRefreshToken) {
          throw new NotFoundException('Учитель не привязал свой Google аккаунт');
        }
      
        // Добавляем секунды к датам для корректного формата ISO и задаем timeZone
        const eventData = {
          summary: `${createCalendarEventDto.type}: ${courseWork.title}`,
          description: `Событие для курсовой работы "${courseWork.title}"`,
          start: { 
            dateTime: new Date(createCalendarEventDto.startDate + ':00').toISOString(),
            timeZone: 'Europe/Moscow',
          },
          end: { 
            dateTime: new Date(createCalendarEventDto.endDate + ':00').toISOString(),
            timeZone: 'Europe/Moscow',
          },
        };
      
        console.log('Отправляем eventData в Google:', eventData);
      
        // Создаем OAuth2 клиент
        const oauth2Client = new google.auth.OAuth2(
          this.configService.get<string>('GOOGLE_CLIENT_ID'),
          this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
          this.configService.get<string>('GOOGLE_REDIRECT_URI'),
        );
        oauth2Client.setCredentials({
          refresh_token: teacher.googleRefreshToken,
        });
      
        try {
          // Получаем актуальный access token
          await oauth2Client.getAccessToken();
        } catch (error) {
          console.error('Ошибка обновления access token:', error);
          throw error;
        }
      
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        // Используем 'primary' в качестве fallback для calendarId
        const calendarId = teacher.googleCalendarId || 'primary';
      
        let googleEvent;
        try {
          const res = await calendar.events.insert({
            calendarId,
            requestBody: eventData,
          });
          googleEvent = res.data;
          console.log('Google Event создан:', googleEvent);
        } catch (error: any) {
          console.error('Ошибка при создании события в Google Calendar:', error.response?.data || error);
          throw error;
        }
      
        // Сохраняем событие в БД
        const calendarEvent = this.calendarEventRepository.create({
          type: createCalendarEventDto.type,
          startDate: new Date(createCalendarEventDto.startDate),
          endDate: new Date(createCalendarEventDto.endDate),
          googleEventId: googleEvent.id,
          courseWork,
        });
        await this.calendarEventRepository.save(calendarEvent);
      
        return calendarEvent;
      }

      async getCalendarEvents(courseWorkId: number): Promise<CalendarEvent[]> {
        const events = await this.calendarEventRepository.find({
          where: { courseWork: { id: courseWorkId } },
          relations: ['courseWork']  // если нужны данные о курсовой работе
        });
        return events;
      }
}
