import { Teacher } from "src/Entities/teacher.entity";

export class TeacherDto {
    id: number;
    firstName: string;
    lastName: string;
    surname: string;
    email: string;
    totalSlots: number;
    availableSlots: number;

    constructor(teacher: Teacher) {
        this.id = teacher.id;
        this.firstName = teacher.firstName;
        this.lastName = teacher.lastName;
        this.surname = teacher.surname;
        this.email = teacher.email;
        this.totalSlots = teacher.totalSlots;
        this.availableSlots = teacher.availableSlots;
    }
}
