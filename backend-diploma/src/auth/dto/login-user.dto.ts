import { IsString, IsEmail, IsNotEmpty } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty({ message: 'Поле email должно быть заполнено' })
    @IsEmail({}, { message: 'Поле email должно быть email'})
    readonly email: string;

    @IsNotEmpty({ message: 'Поле пароль должно быть заполнено' })
    readonly password: string;
}