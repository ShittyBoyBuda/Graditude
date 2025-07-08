import { Student } from "src/Entities/student.entity";

export class StudentDto {
    id: number;
    firstName: string;
    lastName: string;
    surname: string | null;
    email: string;

    constructor(student: Student) {
        this.id = student.id;
        this.firstName = student.firstName;
        this.lastName = student.lastName;
        this.surname = student.surname;
        this.email = student.email;
    }
}