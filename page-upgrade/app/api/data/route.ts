import { getData, getAllData } from "@/app/lib/db";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    try {
        const inicio = request.nextUrl.searchParams.get('inicio');
        const fin = request.nextUrl.searchParams.get('fin');
        if (inicio && fin) {
        const data = await getData(inicio,fin);
        if (data) {
            return NextResponse.json({ status: 200, data });
        }
        }
        const all = request.nextUrl.searchParams.get('all');
        if (all) {
            const data = await getAllData();
            if (data) {
                return NextResponse.json({ status: 200, data });
            }
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