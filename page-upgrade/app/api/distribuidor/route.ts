import {NextRequest, NextResponse} from "next/server";
import {guardarDistribuidor, guardarMovimiento, guardarVentaDistributor} from "@/app/lib/db";

export async function POST(request: NextRequest) {
    try{
        const req = await request.json();
        const  id = req.id;
        const phoneNumber = req.phoneNumber;
        const  firstName = req.firstName;
        const lastName = req.lastName;
        const  secondFirstName = req.secondFirstName;
        const secondLastaName= req.secondLastName;
        await guardarDistribuidor(id,firstName,secondFirstName,secondLastaName,lastName,phoneNumber);
        return NextResponse.json({ status: 200 });
    }
    catch (error) {
        console.error('error:', error);
        return NextResponse.json(
            { error: error }, { status: 500 }
        );
    }
}