import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { Plan } from 'src/Entities/plan.entity';
import { CourseWork } from 'src/Entities/courseWork.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, CourseWork]),
    AuthModule
  ],
  providers: [PlanService],
  controllers: [PlanController]
})
export class PlanModule {}
