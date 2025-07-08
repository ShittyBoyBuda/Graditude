import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateGroupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    studentIds: number[];
}