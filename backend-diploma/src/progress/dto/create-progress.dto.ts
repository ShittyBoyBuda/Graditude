import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { FileType } from "src/Entities/progress.entity";

export class CreateProgressDto {
    @IsEnum(FileType, { message: 'Поле должно быть одним из следующих значений: document или image' })
    fileType: FileType;

    @IsString({ message: 'Поле должно быть строкой' })
    @IsOptional()
    fileLink?: string;

    @IsString({ message: 'Поле должно быть строкой' })
    @IsOptional()
    comments?: string;
}
