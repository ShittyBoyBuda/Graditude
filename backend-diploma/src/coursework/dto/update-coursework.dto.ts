import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { Difficult } from 'src/Entities/courseWork.entity';

export class UpdateCourseworkDto {
    @IsString({ message: 'Поле название должно быть строкой' })
    @IsOptional()
    title?: string;
  
    @IsString({ message: 'Поле описание должго быть строкой' })
    @IsOptional()
    description?: string;
  
    @IsOptional()
    @IsEnum(Difficult, { message: 'Поле сложность должна быть Лёгкая или Средняя или Сложная' })
    difficult?: Difficult;
  
    @IsOptional()
    @IsBoolean({ message: 'Поле доступность должно быть либо true либо false' })
    isAvailable?: boolean

    @IsOptional()
    @IsArray({ message: 'Теги должны быть массивом строк' })
    @ArrayNotEmpty({ message: 'Теги не могут быть пустыми' })
    @ArrayUnique({ message: 'Теги должны быть уникальными' })
    @IsString({ each: true, message: 'Каждый тег должен быть строкой' })
    tags?: string[];

}
