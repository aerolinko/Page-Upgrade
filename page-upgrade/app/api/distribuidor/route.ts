import {NextRequest, NextResponse} from "next/server";
import {
    borrarDistribuidor,
    borrarMovimiento, editarDistribuidor, editarMovimiento,
    getAllDistData,
    getDistributorsData,
    getDistributorsDataByWeight,
    guardarDistribuidor
} from "@/app/lib/db";

export async function GET(request:NextRequest){
    try{
    const dist = request.nextUrl.searchParams.get('dist');
    const mes = request.nextUrl.searchParams.get('mes');
    const modo = request.nextUrl.searchParams.get('modo');
    const peso = request.nextUrl.searchParams.get('peso');
    if (dist && peso && mes && modo) {
        let data:string;
        if(peso=='ambos'){
            data = await getDistributorsData(mes,modo);
        }else{
            data = await getDistributorsDataByWeight(mes,modo,peso);
        }
        if (data) {
            return NextResponse.json({ status: 200, data });
        }
    }

    const all = request.nextUrl.searchParams.get('all');
    if (all) {
        const data = await getAllDistData();
        if (data) {
            return NextResponse.json({ status: 200, data });
        }
    }

    return NextResponse.json({ error: 'Error obteniendo los datos del servidor' }, { status: 500 });

    }
    catch (error) {
        console.error('error:', error);
        return NextResponse.json(
            { error: error }, { status: 500 }
        );
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

export async function DELETE(request: NextRequest) {
    try{
        const id = request.nextUrl.searchParams.get('id');
        if(id){
            await borrarDistribuidor(parseInt(id));
            return NextResponse.json({status: 200});
        }
        return NextResponse.json(
            { error: 'Internal Server Error' }, { status: 500 }
        );
    }
    catch (error) {
        console.error('error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try{
        const req = await request.json();
        const id=req.editingId;
        const state=req.editingState;
        const firstName=req.editingFirstName;
        const lastName=req.editingLastName;
        await editarDistribuidor(id,firstName,lastName,state);
        return NextResponse.json({status: 200});
    }
    catch (error) {
        console.error('error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, { status: 500 }
        );
    }
}