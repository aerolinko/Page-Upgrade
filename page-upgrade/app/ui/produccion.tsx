'use client'
import {useState, useEffect} from "react";
import {redirect} from "next/navigation";
import {
    ArrowUpCircleIcon,
    ScaleIcon,
} from "@heroicons/react/24/outline";
import {Button} from "@/app/ui/button";
import {ArrowRightIcon} from "@heroicons/react/20/solid";

export default function Produccion() {
    const [error, setError] = useState<string>();
    const [mensaje, setMensaje] = useState<string>();
    const [cantidad, setCantidad] = useState<string>('0');
    const [peso, setPeso] = useState<string>('');
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [isZero, setIsZero] = useState<boolean>(true);


    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        console.log('1212')
        const response = await fetch(`/api/data`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({cantidad, peso})
        });
        if (response.ok) {
            const res = await response.json();
            setMensaje('Se ha guardado exitosamente');
            setTimeout(() => setMensaje(''), 2000);
            reset();
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
    }

    function forceExpiredLogOut(res: Response) {
        if (res.status === 401) {
            redirect('/');
        }
    }

    useEffect(() => {
    }, []);

    return (
    <div>
        <div className="w-full">
            <form onSubmit={handleSubmit} id='produccion' className="flex flex-col gap-3">
                <label htmlFor='produccion' className='text-2xl font-semibold p-1'>Agregar Producción</label>
                <label htmlFor='candidad'> Cantidad a guardar </label>
                <div className="relative">
                    <input
                        id="cantidad"
                        type="number"
                        min="1"
                        max="1000"
                        value={cantidad}
                        onClick={()=>{setCantidad("")}}
                        onBlur={()=>{
                            if(isZero){
                                setCantidad("0")
                            }
                        }}
                        onChange={(e) => {
                            setCantidad(limitNumericInput(e,1000));
                            setIsZero(false)
                        }}
                        required
                        className={`[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none peer block w-full rounded-md border
                         ${isZero ? 'text-gray-400' : 'text-blue-300'} border-white py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`}
                    />
                    <ArrowUpCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white" />
                </div>
                <label htmlFor='peso'> Peso </label>
                <div className="relative">
                    <select value={peso} required className={`peer block w-full rounded-md border border-white py-[9px] pl-10 text-sm outline-2 
                    ${isSelected ? 'text-blue-300': 'text-gray-400 italic'}`}
                            id='peso'
                            onChange={(e) => {setPeso(e.target.value); setIsSelected(true)}}
                    >
                        <option value="" disabled hidden>--Elige un peso--</option>
                        <option value='6kg' className='bg-gray-700'>6kg</option>
                        <option value='3kg' className='bg-gray-700'>3kg</option>
                    </select>
                    <ScaleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white" />
                </div>
                {error && (
                    <div className="flex gap-4 mt-2 items-center flex-col sm:flex-row text-red-500">
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
                <Button className="mt-4 w-full">
                    Crear <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                </Button>
            </form>
        </div>

    </div>
    );
}
