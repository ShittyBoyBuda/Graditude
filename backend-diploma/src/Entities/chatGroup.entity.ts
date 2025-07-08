import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Teacher } from "./teacher.entity";
import { Student } from "./student.entity";
import { GroupMessage } from "./grouptMessage.entity";

@Entity()
export class ChatGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @ManyToOne(() => Teacher)
    teacher: Teacher;

    @ManyToMany(() => Student, student => student.groups)
    @JoinTable()
    students: Student[];

    @OneToMany(() => GroupMessage, message => message.chatGroup)
    messages: GroupMessage[];
}