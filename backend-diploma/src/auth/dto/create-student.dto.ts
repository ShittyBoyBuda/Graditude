import { IsString, IsEmail, MinLength, IsNotEmpty, IsOptional } from "class-validator";

export class CreateStudentDto {
    @IsNotEmpty({ message: 'Поле имя должно быть заполнено'})
    @IsString({ message: 'Поле имя должно быть строкой'})
    readonly firstName: string;

    @IsNotEmpty({ message: 'Поле фамилия должно быть заполнено'})
    @IsString({ message: 'Поле фамилия должно быть строкой'})
    readonly lastName: string;

    @IsOptional()
    @IsString({ message: 'Поле отчество должно быть строкой'})
    readonly surname?: string;

    @IsNotEmpty({ message: 'Поле email должно быть заполнено'})
    @IsEmail({}, { message: 'Поле email должно быть email'})
    readonly email: string;

    @IsNotEmpty({ message: 'Поле пароль должно быть заполнено'})
    @MinLength(6, { message: 'Поле пароль должно содержать минимум 6 символов'})
    readonly password: string;
}