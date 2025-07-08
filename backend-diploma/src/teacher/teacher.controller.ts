import { Body, Controller, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherController {
    constructor(private readonly teacherService: TeacherService) {}

    @Get()
    async getTeacher() {
        return this.teacherService.getAllTeachers();
    }

    @Get('students')
    async getStudents(@Request() req) {
        const id = req.user.id;
        return this.teacherService.getAllStudents(id);
    }

    @Patch('slots')
    @Roles('teacher')
    async updateTotalSlots(@Body() { totalSlots }: { totalSlots: number }, @Request() req) {
        const teacherId = req.user.id;
        return this.teacherService.updateTeacherSlots(teacherId, totalSlots);
    }

}
