import { Controller, Post, Get, ParseIntPipe, Param, Body, UseGuards } from '@nestjs/common';
import { CourseworkService } from 'src/coursework/coursework.service';
import { CreateCalendarEventDto } from './dto/createCalendarEvent.dto';
import { CalendarEvent } from 'src/Entities/CalendarEvent.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

@Controller('coursework/:courseWorkId/calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoogleCalendarServiceController {
  constructor(private readonly courseworkService: CourseworkService) {}

  @Post()
  @Roles('teacher')
  async addCalendarEvent(
    @Param('courseWorkId', ParseIntPipe) courseWorkId: number,
    @Body() createCalendarEventDto: CreateCalendarEventDto,
  ) {
    console.log('Запрос на создание события пришёл. courseWorkId:', courseWorkId, createCalendarEventDto);
    return this.courseworkService.addCalendarEvent(courseWorkId, createCalendarEventDto);
  }

  @Get()
  async getCalendarEvents(
    @Param('courseWorkId', ParseIntPipe) courseWorkId: number,
  ): Promise<CalendarEvent[]> {
    return this.courseworkService.getCalendarEvents(courseWorkId);
  }
}
