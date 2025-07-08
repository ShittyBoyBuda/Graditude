import { Body, Controller, Get, Param, Post, UseGuards, Request, Patch } from '@nestjs/common';
import { PlanService } from './plan.service';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePlanDto } from './dto/CreatePlanDto.dto';


@Controller('plan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @Post(':courseWorkId')
    @Roles('teacher')
    async createPlan(
        @Param('courseWorkId') courseWorkId: string,
        @Body() createPlanDto: CreatePlanDto,
        @Request() req
    ) {
        const id = parseInt(courseWorkId);
        return this.planService.createPlan(id, createPlanDto, req.user.id, req.user.role);
    }

    @Get(':courseWorkId')
    async getPlan(@Param('courseWorkId') courseWorkId: string, @Request() req) {
        const id = parseInt(courseWorkId);
        return this.planService.getPlan(id, req.user.id, req.user.role);
    }

    @Patch(':courseWorkId/plan')
    @Roles('teacher', 'student')
    async updatePlan(
        @Param('courseWorkId') courseWorkId: string,
        @Body() dto: CreatePlanDto,
        @Request() req
    ) {
        const id = parseInt(courseWorkId);
        return this.planService.updatePlan(id, dto, req.user.id, req.user.role);
    }
}
