import { Entity ,PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from "typeorm";
import { Teacher } from "./teacher.entity";
import { CourseWork } from "./courseWork.entity";
import { Progress } from "./progress.entity";
import { ChatGroup } from "./chatGroup.entity";

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    surname: string | null;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @ManyToOne(() => Teacher, (teacher) => teacher.students)
    teacher: Teacher;

    @ManyToOne(() => CourseWork, (courseWork) => courseWork.student)
    courseWork: CourseWork;

    @OneToMany(() => Progress, (progress) => progress.student)
    progresses: Progress[];

    @ManyToMany(() => ChatGroup, group => group.students)
    groups: ChatGroup[];
}