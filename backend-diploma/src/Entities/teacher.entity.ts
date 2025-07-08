import { Entity ,PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Student } from "./student.entity";
import { CourseWork } from "./courseWork.entity";

@Entity()
export class Teacher {
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

    @Column({ default: 0 })
    totalSlots: number;

    @OneToMany(() => CourseWork, (courseWork) => courseWork.teacher)
    courseWorks: CourseWork[];

    @OneToMany(() => Student, (student) => student.teacher)
    students: Student[];

    get occupiedSlots(): number {
        return this.students?.length || 0;
    }

    get availableSlots(): number {
        return this.totalSlots - this.occupiedSlots;
    }

    // Добавляем поля для Google OAuth
    @Column({ nullable: true })
    googleRefreshToken: string;

    // Если нужно хранить отдельный идентификатор календаря (иначе можно использовать email как идентификатор основного календаря)
    @Column({ nullable: true })
    googleCalendarId: string;
}