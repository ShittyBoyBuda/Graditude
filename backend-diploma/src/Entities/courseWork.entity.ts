import { Entity ,PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { Student } from "./student.entity";
import { Teacher } from "./teacher.entity";
import { Progress } from "./progress.entity";
import { Tag } from "./Tag.entity";
import { Plan } from "./plan.entity";
import { Task } from "./task.entity";
import { CalendarEvent } from "./CalendarEvent.entity";


export enum Difficult {
    Easy = 'Лёгкая',
    Medium = 'Средняя',
    Hard = 'Сложная',
}

@Entity()
export class CourseWork {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ type: 'enum', enum: Difficult })
    difficult: Difficult;

    @Column({ default: true})
    isAvailable: boolean;

    @OneToOne(() => Student, (student) => student.courseWork)
    student: Student;

    @ManyToOne(() => Teacher, (teacher) => teacher.courseWorks)
    teacher: Teacher;

    @OneToMany(() => Progress, (progress) => progress.courseWork)
    progresses: Progress[];

    @ManyToMany(() => Tag, (tag) => tag.courseWorks, { cascade: true })
    @JoinTable()
    tags: Tag[];

    @OneToOne(() => Plan, (plan) => plan.courseWork, { cascade: true })
    @JoinColumn() 
    plans: Plan;

    @OneToMany(() => Task, (task) => task.courseWork)
    tasks: Task[];

    @OneToMany(() => CalendarEvent, (calendarEvent) => calendarEvent.courseWork, { cascade: true })
    calendarEvents: CalendarEvent[];
}