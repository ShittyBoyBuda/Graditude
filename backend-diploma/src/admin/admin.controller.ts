import { Controller, Post, Body, Get, Res, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { Roles } from 'src/roles/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Endpoint для создания (регистрации) админа
  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async registerAdmin(@Body() body: { email: string; password: string }) {
    const admin = await this.adminService.createAdmin(body.email, body.password);
    return { message: 'Admin created', admin };
  }

  // Endpoint для логина админа
  @Post('login')
  async loginAdmin(@Body() body: { email: string; password: string }) {
    return this.adminService.loginAdmin(body.email, body.password);
  }

  // Endpoint для экспорта всех данных (доступен только администратору)
  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async exportAllData(@Res() res: Response) {
    const buffer = await this.adminService.exportAllDataToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=all-data.xlsx',
    });
    res.end(buffer);
  }
}
