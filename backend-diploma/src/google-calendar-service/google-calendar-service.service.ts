import { Injectable } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Teacher } from 'src/Entities/teacher.entity';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleCalendarServiceService {
  constructor(private configService: ConfigService) {}

  private async getOAuth2Client(teacher: Teacher): Promise<OAuth2Client> {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    ) as OAuth2Client;

    oauth2Client.setCredentials({
      refresh_token: teacher.googleRefreshToken,
    });

    try {
      // Запрашиваем access token, чтобы убедиться, что он обновлён
      await oauth2Client.getAccessToken();
    } catch (error) {
      console.error('Ошибка обновления access token:', error);
      throw error;
    }

    return oauth2Client;
  }

  private async getCalendar(teacher: Teacher) {
    const oauth2Client = await this.getOAuth2Client(teacher);
    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async createEvent(
    teacher: Teacher,
    eventData: calendar_v3.Params$Resource$Events$Insert['requestBody'],
  ): Promise<calendar_v3.Schema$Event> {
    try {
        console.log('Отправляем eventData в Google:', eventData);
      const calendar = await this.getCalendar(teacher);
      const calendarId = teacher.googleCalendarId || 'primary';
      const res = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
      });
      return res.data;
    } catch (error: any) {
      console.error('Error creating event in Google Calendar:', error.response?.data || error);
      throw error;
    }
  }
  

  async updateEvent(
    teacher: Teacher,
    eventId: string,
    eventData: calendar_v3.Params$Resource$Events$Update['requestBody'],
  ): Promise<calendar_v3.Schema$Event> {
    const calendar = await this.getCalendar(teacher);
    const calendarId = teacher.googleCalendarId || teacher.email || 'primary';
    const res = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventData,
    });
    return res.data;
  }

  async deleteEvent(teacher: Teacher, eventId: string): Promise<void> {
    const calendar = await this.getCalendar(teacher);
    const calendarId = teacher.googleCalendarId || teacher.email || 'primary';
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  }
}
