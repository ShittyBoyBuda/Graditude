import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/Entities/teacher.entity';
import { Student } from 'src/Entities/student.entity';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Teacher, Student]),
        AuthModule,
    ],
    controllers: [TeacherController],
    providers: [TeacherService],
})
export class TeacherModule {}
