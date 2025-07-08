import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { CourseWork } from "./courseWork.entity";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column({ default: false })
    completed: boolean;

    @ManyToOne(() => CourseWork, (courseWork) => courseWork.tasks)
    courseWork: CourseWork;
}