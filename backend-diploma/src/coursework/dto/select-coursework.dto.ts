import { IsInt, IsNotEmpty } from "class-validator";

export class SelectCourseWorkDto {
    @IsInt({ message: 'Поле id темы должно быть числом'})
    @IsNotEmpty({ message: 'Поле id темы должно быть заполнено' })
    courseWorkId: number;
}