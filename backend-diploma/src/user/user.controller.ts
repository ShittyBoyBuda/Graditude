import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';


@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('profile')
    async getProfile(@Req() req) {
        const { email, role } = req.user;

        if (role === 'teacher') {
            return this.userService.getTeacherByEmail(email);
        } else if (role === 'student') {
            return this.userService.getStudentByEmail(email);
        }

        throw new Error('Неправильная роль');
    }
}
