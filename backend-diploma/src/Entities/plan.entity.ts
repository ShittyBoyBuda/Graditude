import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { CourseWork } from "./courseWork.entity";

@Entity()
export class Plan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    title?: string;

    @Column('jsonb')
    structure: {
        chapters: Array<{
            title: string;
            sections: string[];
        }>;
    };

    @OneToOne(() => CourseWork, (courseWork) => courseWork.plans)
    courseWork: CourseWork;
}