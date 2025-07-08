import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Student } from "./student.entity";
import { Teacher } from "./teacher.entity";
import { ChatGroup } from "./chatGroup.entity";

@Entity()
export class GroupMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, { nullable: true, eager: true })
    @JoinColumn()
    senderStudent?: Student;

    @ManyToOne(() => Teacher, { nullable: true, eager: true  })
    @JoinColumn()
    senderTeacher?: Teacher;

    @ManyToOne(() => ChatGroup)
    chatGroup: ChatGroup;

    @Column()
    content: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;
}