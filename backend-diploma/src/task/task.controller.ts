import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/CreateTaskDto.dto';

@Controller('task')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post(':courseWorkId')
    @Roles('teacher', 'student')
    async createTask(
        @Param('courseWorkId') courseWorkId: string,
        @Body() createTaskDto: CreateTaskDto,
        @Request() req
    ) {
        const id = parseInt(courseWorkId);
        return this.taskService.createTask(id, createTaskDto, req.user.id, req.user.role);
    }

    @Patch(':taskId')
    async updateTask(
        @Param('taskId') taskId: string,
        @Body() updateTaskDto: Partial<CreateTaskDto>
    ) {
        const id = parseInt(taskId);
        return this.taskService.updateTask(id, updateTaskDto);
    }

    @Get(':courseWorkId')
    async getTasks(@Param('courseWorkId') courseWorkId: string, @Request() req) {
        const id = parseInt(courseWorkId);
        return this.taskService.getTask(id, req.user.id, req.user.role);
    }

    @Delete(':courseWorkId/task/:taskId')
    @Roles('teacher', 'student')
    async deleteTask(
        @Param('courseWorkId') courseWorkId: string,
        @Param('taskId') taskId: string,
        @Request() req
    ) {
        return this.taskService.deleteTask(
            parseInt(courseWorkId),
            parseInt(taskId),
            req.user.id,
            req.user.role
        );
    }
}
