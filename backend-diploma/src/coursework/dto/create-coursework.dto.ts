import { IsString, IsNotEmpty, IsEnum, IsBoolean, ArrayNotEmpty, ArrayUnique, IsArray, IsInt, Min } from 'class-validator';
import { Difficult } from 'src/Entities/courseWork.entity';

export class CreateCourseworkDto {
  @IsString({ message: 'Поле название должно быть строкой' })
  @IsNotEmpty({ message: 'Поле название должно быть заполнено' })
  title: string;

  @IsString({ message: 'Поле описание должго быть строкой' })
  @IsNotEmpty({ message: 'Поле описание должно быть заполнено' })
  description: string;

  @IsEnum(Difficult, { message: 'Поле сложность должна быть Лёгкая или Средняя или Сложная' })
  difficult: Difficult;

  @IsArray({ message: 'Теги должны быть массивом строк' })
  @ArrayNotEmpty({ message: 'Массив тегов не должен быть пустым' })
  @ArrayUnique({ message: 'Теги должны быть уникальными' })
  @IsString({ each: true , message: 'Каждый тег должен быть строкой' })
  tags: string[];

}
