import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Student } from "./student.entity";
import { Teacher } from "./teacher.entity";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, { nullable: true })
    @JoinColumn()
    senderStudent?: Student;

    @ManyToOne(() => Teacher, { nullable: true })
    @JoinColumn()
    senderTeacher?: Teacher;

    @ManyToOne(() => Student, { nullable: true })
    @JoinColumn({ name: 'receiverStudentId'})
    receiverStudent?: Student;

    @ManyToOne(() => Teacher, { nullable: true })
    @JoinColumn({ name: 'receiverTeacherId'})
    receiverTeacher?: Teacher;

    @Column()
    content: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ default: false })
    isRead: boolean;

    
}