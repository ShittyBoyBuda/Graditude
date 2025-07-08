import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { CourseWork } from "./courseWork.entity";

export enum DeadlineType {
    Theoretical = 'Теоретическая',
    Practical = 'Практическая',
    PreDefense = 'Предзащита',
    Defense = 'Защита',
}

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DeadlineType })
  type: DeadlineType;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp')
  endDate: Date;

  // Сохраняем идентификатор события из Google Calendar для синхронизации
  @Column({ nullable: true })
  googleEventId: string;

  @ManyToOne(() => CourseWork, (courseWork) => courseWork.calendarEvents, { onDelete: 'CASCADE' })
  courseWork: CourseWork;
}