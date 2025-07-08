// create-calendar-event.dto.ts
import { IsEnum, IsISO8601 } from 'class-validator';
import { DeadlineType } from '../../Entities/CalendarEvent.entity';

export class CreateCalendarEventDto {
  @IsEnum(DeadlineType)
  type: DeadlineType;

  @IsISO8601()
  startDate: string; // передадим в ISO формате

  @IsISO8601()
  endDate: string;
}
