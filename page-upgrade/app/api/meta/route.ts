import {NextRequest, NextResponse} from "next/server";
import {getAllGoals, getDataGoalPerMonth, guardarDistribuidor, guardarMeta} from "@/app/lib/db";

export async function GET(request: NextRequest) {
    try {
        const top = request.nextUrl.searchParams.get('top');
        if(top){
            const data=await getDataGoalPerMonth()
            return NextResponse.json({data}, {status: 200});
        }

        const all = request.nextUrl.searchParams.get('all');
        if(all){
            const data=await getAllGoals()
            return NextResponse.json({data}, {status: 200});
        }
    }
    catch(err){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try{
        const req = await request.json();
        const  goalAmount = req.goalAmount;
        const goalType = req.goalType;
        await guardarMeta(goalAmount,goalType);
        return NextResponse.json({ status: 200 });
    }
    catch (error) {
        console.error('error:', error);
        return NextResponse.json(
            { error: error }, { status: 500 }
        );
    }
}