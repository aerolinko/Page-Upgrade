import {NextRequest, NextResponse} from "next/server";
import {getDistributorsData, guardarDistribuidor} from "@/app/lib/db";

export async function GET(request:NextRequest){
    const dist = request.nextUrl.searchParams.get('dist');
    const mes = request.nextUrl.searchParams.get('mes');
    const modo = request.nextUrl.searchParams.get('modo');
    if (dist && mes && modo) {
        const data = await getDistributorsData(mes,modo);
        if (data) {
            return NextResponse.json({ status: 200, data });
        }
    }
}



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