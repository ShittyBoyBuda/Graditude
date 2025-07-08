import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { CourseWork } from "./courseWork.entity";
import { Student } from "./student.entity";

export enum FileType {
    Document = 'document',
    Image = 'image',
}

@Entity()
export class Progress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: FileType})
    fileType: FileType;

    @Column({ type: 'text'})
    fileLink: string;

    @Column({ type: 'text', nullable: true })
    comments: string | null;

    @ManyToOne(() => CourseWork, (courseWork) => courseWork.progresses)
    @JoinColumn({ name: 'courseWorkId' })
    courseWork: CourseWork;

    @ManyToOne(() => Student, (student) => student.progresses)
    @JoinColumn({ name: 'studentId' })
    student: Student;
}