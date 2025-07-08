import { Controller, Post, Get, UploadedFile, UseInterceptors, Body, Param, UseGuards, BadRequestException, Request, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import multer from 'multer';
import { memoryStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';


@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
    constructor(
        private readonly progressService: ProgressService,
    ) {}

    @Post('upload/:courseWorkId/:studentId')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('courseWorkId') courseWorkId: string,
        @Param('studentId') studentId: string,
        @Body() createProgressDto: CreateProgressDto,
        @Request() req,
    ) {
        const userId = req.user.id;
        const role = req.user.role;
        const idCourseWork = parseInt(courseWorkId);
        const idStudent = parseInt(studentId);

        if (!file) {
            throw new BadRequestException('Файл не загружен');
        }

        const fileName = uuidv4() + path.extname(file.originalname);
        const filePath = `./uploads/${fileName}`;

        try {
            const progress = await this.progressService.createProgress({
                ...createProgressDto,
                fileLink: `/uploads/${fileName}`,
            }, idCourseWork, userId, role);
            
            await fs.writeFile(filePath, file.buffer);

            return progress;

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id')
    async getProgressByCourseWork(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        const role = req.user.role;
        const courseWorkId = parseInt(id);
        return this.progressService.getProgressByCourseWork(courseWorkId, userId, role);
    }

    @Delete(':id')
    async deleteProgress(@Param('id') id: string, @Request() req) {
        const progressId = parseInt(id);
        const userId = req.user.id;
        const role = req.user.role;
        return this.progressService.deleteProgress(progressId, userId, role);
    }
}
