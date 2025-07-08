import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Request, Res } from '@nestjs/common';
import { CourseworkService } from './coursework.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { CreateCourseworkDto } from './dto/create-coursework.dto';
import { UpdateCourseworkDto } from './dto/update-coursework.dto';
import { SelectCourseWorkDto } from './dto/select-coursework.dto';
import { Response } from 'express';

@Controller('coursework')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseworkController {
    constructor(private readonly courseworkService: CourseworkService) {}

    @Post()
    @Roles('teacher')
    async createCourseWork(@Body() createCourseWorkDto: CreateCourseworkDto, @Request() req) {
        const teacherId = req.user.id;
        return this.courseworkService.createCourseWork(createCourseWorkDto, teacherId);
    }

    @Get()
    async getAllCourseWorks() {
        return this.courseworkService.getAllCourseworks();
    }

    @Get('my')
    async getCourseWork(@Request() req) {
        const { id, role } = req.user;

        if (role === 'teacher') {
            return this.courseworkService.findCourseWorkByTeacher(id);
        } else if (role === 'student') {
            return this.courseworkService.findCourseWorkByStudent(id);
        }

        throw new Error('Неправильная роль');
    }

    @Patch(':id')
    @Roles('teacher')
    async updateCourseWork(@Param('id') id: string, @Body() updateCourseWorkDto: UpdateCourseworkDto, @Request() req) {
        const teacherId = req.user.id;
        const courseWorkId = parseInt(id);
        return this.courseworkService.updateCourseWork(courseWorkId, teacherId, updateCourseWorkDto);
    }

    @Delete(':id')
    @Roles('teacher')
    async deleteCourseWork(@Param('id') id: string, @Request() req) {
        const teacherId = req.user.id;
        const courseWorkId = parseInt(id);
        return this.courseworkService.deleteCourseWork(courseWorkId, teacherId);
    }

    @Post('select')
    @Roles('student')
    async selectCourseWork(@Body() selectCourseWork: SelectCourseWorkDto, @Request() req) {
        const studentId = req.user.id;
        return this.courseworkService.selectCourseWork(selectCourseWork, studentId)
    }

    @Get('export')
    @Roles('teacher')
    async exportCourseworks(@Request() req, @Res() res: Response) {
        const teacherId = req.user.id;
        const buffer = await this.courseworkService.exportCourseworksToExcel(teacherId);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=courseworks.xlsx',
        });
        res.end(buffer);
    }
}
