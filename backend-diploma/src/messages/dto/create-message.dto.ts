import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    @IsNotEmpty()
    receiverId: number;

    @IsEnum(['student', 'teacher'])
    receiverRole: 'student' | 'teacher';
}