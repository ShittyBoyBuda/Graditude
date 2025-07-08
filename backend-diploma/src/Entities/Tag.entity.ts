import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { CourseWork } from "./courseWork.entity";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => CourseWork, (courseWork) => courseWork.tags)
    courseWorks: CourseWork[];
}