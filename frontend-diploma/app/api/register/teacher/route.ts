import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const data = await req.json();

    try {
        const response = await axios.post('http://localhost:3000/auth/register/teacher', data);
        return NextResponse.json(response.data);

    } catch (error) {
        console.error('error: ', error);
        return NextResponse.json({ error: 'Register failed' }, { status: 500 });
    }
}