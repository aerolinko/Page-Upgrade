import {
    getData,
    getAllData,
    getStock,
    getStockComponents,
    guardarProduccion,
    getOnly6kg,
    getOnly3kg
} from "@/app/lib/db";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    try {

        const inicio = request.nextUrl.searchParams.get('inicio');
        const fin = request.nextUrl.searchParams.get('fin');
            if (inicio && fin) {
                const is3kg = request.nextUrl.searchParams.get('3kg');
                const is6kg = request.nextUrl.searchParams.get('6kg');
            if( is3kg && is6kg ) {
            const data = await getData(inicio,fin);
                if (data) {
                    return NextResponse.json({ status: 200, data });
                    }
                }
            else if (is6kg && !is3kg ) {
                const data = await getOnly6kg(inicio,fin);
                if (data) {
                    return NextResponse.json({ status: 200, data });
                }
            }
            else if (is3kg && !is6kg ) {
                        const data = await getOnly3kg(inicio,fin);
                        if (data) {
                            return NextResponse.json({ status: 200, data });
                        }
                    }
                }
        const all = request.nextUrl.searchParams.get('all');
            if (all) {
            const data = await getAllData();
                if (data) {
                    return NextResponse.json({ status: 200, data });
                }
            }

        const stock = request.nextUrl.searchParams.get('stock');
        if (stock) {
            const data = await getStock();
            if (data) {
                return NextResponse.json({ status: 200, data });
            }
        }

        const stockComponent = request.nextUrl.searchParams.get('stockComponent');
        if (stockComponent) {
            const data = await getStockComponents();
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


export async function POST(request: NextRequest) {
    try{
        const req = await request.json();
        const  peso = req.peso;
        const cantidad = req.cantidad;
        if (req) {
            await guardarProduccion('Produccion',cantidad,peso);
            return NextResponse.json({ status: 200 });
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