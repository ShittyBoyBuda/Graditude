export class CreatePlanDto {
    structure: {
        chapters: Array<{
            title: string;
            sections: string[];
        }>;
    };
}