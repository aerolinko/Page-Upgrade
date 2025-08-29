'use client'
import {useState, useEffect} from "react";
import {redirect} from "next/navigation";
import {
    ArrowUpCircleIcon, ClipboardIcon,
    ScaleIcon,
} from "@heroicons/react/24/outline";
import {Button} from "@/app/ui/button";
import {ArrowRightIcon} from "@heroicons/react/20/solid";

export default function Special({stateSpecial, setStateSpecial}:{
    stateSpecial: boolean;
    setStateSpecial: React.Dispatch<React.SetStateAction<boolean>>;
}) {

    interface StockComponent {
        peso_3kg: number;
        peso_6kg: number;
    }

    const [error, setError] = useState<string>();
    const [stockComponents, setStockComponents] = useState<StockComponent>({peso_3kg: 0, peso_6kg: 0});
    const [mensaje, setMensaje] = useState<string>();
    const [cantidad, setCantidad] = useState<string>('0');
    const [peso, setPeso] = useState<string>('');
    const [motivo, setMotivo] = useState<string>('');
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [isSelectedMotive, setIsSelectedMotive] = useState<boolean>(false);
    const [isZero, setIsZero] = useState<boolean>(true);


    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        if((parseInt(cantidad) <= stockComponents.peso_6kg && peso=='6kg') ||
            (parseInt(cantidad) <= stockComponents.peso_3kg && peso=='3kg')) {
        const response = await fetch(`/api/data?special=1`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({cantidad, peso, motivo})
        });
        if (response.ok) {
            const res = await response.json();
            await fetchStockComponents();
            setMensaje('Se ha guardado exitosamente');
            setTimeout(() => setMensaje(''), 2000);
            reset();
            stateSpecial ? setStateSpecial(false) : setStateSpecial(true);
        } else {
            forceExpiredLogOut(response);
            setError("Error obteniendo los datos del servidor");
            }
        }
        else {
            setError(`Error, la venta excede la cantidad en stock para bolsas de ${peso}`);
            setTimeout(()=> setError(""),5000);
        }

    }

    async function fetchStockComponents() {
        const response = await fetch(`/api/data?stockComponent=1`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });
        if (response.ok) {
            const res = await response.json();
            setStockComponents(res.data[0]);
        } else {
            forceExpiredLogOut(response);
            setError("Error obteniendo los datos del servidor");
        }

    }

    function limitNumericInput(e: React.ChangeEvent<HTMLInputElement>, max:number){
        if(parseInt(e.target.value) > max){
            return max.toString();
        }
        else return e.target.value;
    }

    function reset(){
        setError('');
        setCantidad("0");
        setPeso("");
        setIsZero(true);
        setIsSelected(false);
        setIsSelectedMotive(false);
        setMotivo('')
    }

    function forceExpiredLogOut(res: Response) {
        if (res.status === 401) {
            redirect('/');
        }
    }

    useEffect(() => {
        fetchStockComponents();
    }, []);

    return (
        <div>
            <div className="w-full">
                <form onSubmit={handleSubmit} id='produccion' className="flex flex-col gap-3">
                    <label htmlFor='produccion' className='text-2xl font-semibold p-1 text-center'>Casos Especiales</label>
                    <label htmlFor='candidad'> Cantidad de bolsas </label>
                    <div className="relative">
                        <input
                            id="cantidad"
                            type="number"
                            min="1"
                            max="1000"
                            value={cantidad}
                            onClick={()=>{
                                if(isZero) {
                                    setCantidad("")
                                }
                            }}
                            onBlur={()=>{
                                if(isZero || cantidad === ""){
                                    setCantidad("0")
                                    setIsZero(true);
                                }
                            }}
                            onChange={(e) => {
                                setCantidad(limitNumericInput(e,1000));
                                setIsZero(false)
                            }}
                            required
                            className={`[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none peer block w-full rounded-md border
                         ${isZero ? 'text-gray-400' : 'text-purple-300'} border-white py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`}
                        />
                        <ArrowUpCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white" />
                    </div>
                    <label htmlFor='peso'> Peso </label>
                    <div className="relative">
                        <select value={peso} required className={`peer block w-full rounded-md border border-white py-[9px] pl-10 text-sm outline-2 
                    ${isSelected ? 'text-purple-300': 'text-gray-400 italic'}`}
                                id='peso'
                                onChange={(e) => {setPeso(e.target.value); setIsSelected(true)}}
                        >
                            <option value="" disabled hidden>--Elige un peso--</option>
                            <option value='6kg' className='bg-gray-700'>6kg</option>
                            <option value='3kg' className='bg-gray-700'>3kg</option>
                        </select>
                        <ScaleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white" />
                    </div>
                    {peso && stockComponents &&(
                        <div className='text-sm text-purple-300'> Stock disponible de {peso}: {peso=='6kg' ? new Intl.NumberFormat('es-VE').format(stockComponents.peso_6kg)  : new Intl.NumberFormat('es').format(stockComponents.peso_3kg)} </div>
                    )}
                    <label htmlFor='motivo'> Motivo </label>
                    <div className="relative">
                        <select value={motivo} required className={`peer block w-full rounded-md border border-white py-[9px] pl-10 text-sm outline-2 
                    ${isSelectedMotive ? 'text-purple-300': 'text-gray-400 italic'}`}
                                id='motivo'
                                onChange={(e) => {setMotivo(e.target.value); setIsSelectedMotive(true)}}
                        >
                            <option value="" disabled hidden>--Elige un motivo--</option>
                            <option value='Bolsa defectuosa' className='bg-gray-700'>Bolsa defectuosa</option>
                            <option value='Evento/Regalo' className='bg-gray-700'>Evento/Regalo</option>
                        </select>
                        <ClipboardIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white" />
                    </div>
                    {error && (
                        <div className="flex text-justify text-[15px] gap-4 mt-2 items-center flex-col sm:flex-row text-red-500">
                            <a>
                                {error}
                            </a>
                        </div>
                    )
                    }
                    {mensaje && (
                        <div className="flex gap-4 mt-2 items-center flex-col sm:flex-row text-green-500">
                            <a>
                                {mensaje}
                            </a>
                        </div>
                    )
                    }
                    <Button className={`w-full ${peso ? 'mt-0' : 'mt-4'}`}>
                        Crear <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                    </Button>
                </form>
            </div>

        </div>
    );
}
