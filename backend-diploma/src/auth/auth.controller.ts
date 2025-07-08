import { Controller, Post, Get, Body, Req, Res, BadRequestException, Request, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { TeacherService } from 'src/teacher/teacher.service';
import { JwtAuthGuard } from './jwt-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly teacherService: TeacherService,
    ) {}

    @Post('register/teacher')
    async createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
        return this.authService.registerTeacher(createTeacherDto);
    }

    @Post('register/student')
    async createStudent(@Body() createStudentDto: CreateStudentDto) {
        return this.authService.registerStudent(createStudentDto);
    }

    @Post('login/teacher')
    async loginTeacher(@Body() loginUserDto: LoginUserDto) {
        return this.authService.loginTeacher(loginUserDto);
    }

    @Post('login/student')
    async loginStudent(@Body() loginUserDto: LoginUserDto) {
        return this.authService.loginStudent(loginUserDto);
    }

    @Get('google/callback')
    async googleAuthCallback(@Request() req, @Res() res: Response) {
        const code = req.query.code as string;
        const state = req.query.state as string;
        if (!code || !state) {
        throw new BadRequestException('Отсутствует код авторизации или state');
        }
        // Извлекаем идентификатор учителя из state
        const teacherId = parseInt(state, 10);
        if (isNaN(teacherId)) {
        throw new BadRequestException('Некорректный teacherId в state');
        }

        const oauth2Client = new google.auth.OAuth2(
        this.configService.get<string>('GOOGLE_CLIENT_ID'),
        this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        this.configService.get<string>('GOOGLE_REDIRECT_URI'),
        );

        // Обмениваем код на токены
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
        // При использовании prompt: 'consent' refresh token должен вернуться
        throw new BadRequestException('Refresh token не получен. Возможно, пользователь уже авторизовался ранее.');
        }

        // Сохраняем refresh token для учителя (метод updateTeacherGoogleToken должен обновлять соответствующие поля в БД)
        await this.teacherService.updateTeacherGoogleToken(teacherId, tokens.refresh_token);

        // Перенаправляем учителя обратно в приложение
        res.redirect('http://localhost:3001/my');
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req) {
    const teacherId = req.user?.id;
    if (!teacherId) {
        throw new BadRequestException('Отсутствует идентификатор учителя');
    }
    return { teacherId };
    }

    @Get('google-init')
    async googleInit(@Query('teacherId') teacherId: string, @Res() res: Response) {
    if (!teacherId) {
        throw new BadRequestException('Отсутствует идентификатор учителя');
    }
    const oauth2Client = new google.auth.OAuth2(
        this.configService.get<string>('GOOGLE_CLIENT_ID'),
        this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
    const scopes = ['https://www.googleapis.com/auth/calendar', 'email', 'profile'];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: teacherId, // teacherId передаётся в state
    });
    res.json({ url });
    }

}
