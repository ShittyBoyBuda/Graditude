import { NextRequest, NextResponse } from "next/server";
import axios from "axios";


export async function GET() {
    try {
        const response = await axios.get(`http://localhost:3000/coursework`);
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Ошибка получения списка работ:", error?.response?.data || error.message);
        return NextResponse.json(
            { error: "Failed to fetch coursework", details: error?.response?.data || "Internal server error" },
            { status: error?.response?.status || 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const data = await req.json();

    try {
        const response = await axios.post(`http://localhost:3000/coursework`, data);
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Ошибка создания работы:", error?.response?.data || error.message);
        return NextResponse.json(
            { error: "Failed to create coursework", details: error?.response?.data || "Internal server error" },
            { status: error?.response?.status || 500 }
        );
    }
}
