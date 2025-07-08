import { TeacherDto } from 'src/teacher/dto/TeacherDto.dto';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { Tag } from 'src/Entities/Tag.entity';
import { Progress } from 'src/Entities/progress.entity';
import { Student } from 'src/Entities/student.entity';

export class CourseWorkDto {
    id: number;
    title: string;
    description: string;
    difficult: string;
    isAvailable: boolean;
    teacher: TeacherDto;
    student: Student;
    progresses: Progress[];
    tags: Tag[];

    constructor(courseWork: CourseWork) {
        this.id = courseWork.id;
        this.title = courseWork.title;
        this.description = courseWork.description;
        this.difficult = courseWork.difficult;
        this.isAvailable = courseWork.isAvailable;
        this.student = courseWork.student;
        this.teacher = new TeacherDto(courseWork.teacher);
        this.progresses = courseWork.progresses;
        this.tags = courseWork.tags;
    }
}
