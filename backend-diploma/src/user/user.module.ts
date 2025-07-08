import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Teacher } from 'src/Entities/teacher.entity'; 
import { Student } from 'src/Entities/student.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, Student]),
    AuthModule,
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
