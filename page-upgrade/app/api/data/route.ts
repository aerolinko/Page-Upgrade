import { getData } from "@/app/lib/db";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
    try {
        const data = await getData();
        if (data) {
            return NextResponse.json({ status: 200, data });
        }
        return NextResponse.json(
            { error: 'Internal Server Error' }, { status: 500 }
        );
    } catch (error) {
        console.error('data error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, { status: 500 }
        );
    }
}