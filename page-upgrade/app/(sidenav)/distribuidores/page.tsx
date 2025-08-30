"use client";

import { useState } from "react";
import {IdentificationIcon, KeyIcon, PhoneIcon, UserIcon} from "@heroicons/react/24/outline";
import {ArrowRightIcon} from "@heroicons/react/20/solid";
import {Button} from "@/app/ui/button";
import {redirect} from "next/navigation";
import {Alert} from "@mui/material";


export default function LoginPage() {
    const [firstName, setFistName] = useState("");
    const [lastName, setLastName] = useState("");
    const [secondFirstName, setSecondFistName] = useState("");
    const [secondLastName, setSecondLastName] = useState("");
    const [id, setID] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    function forceExpiredLogOut(res: Response) {
        if (res.status === 401) {
            redirect('/');
        }
    }

    function reset() {
        setError('')
        setPhoneNumber('')
        setLastName('')
        setID('')
        setSecondLastName('')
        setFistName('')
        setSecondFistName('')
    }

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        if(id.length>=7 && id.length<9 && phoneNumber.length==10){
            const response = await fetch(`/api/distribuidor`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({firstName,secondFirstName,secondLastName, lastName,phoneNumber,id}),
            });
            if (response.ok) {
                const res = await response.json();
                reset();
                setMensaje('Distribuidor registrado exitosamente.');
                setTimeout(() =>{setMensaje('')},5000)
            } else {
                const res = await response.json();
                forceExpiredLogOut(response);
                console.log(res.error.code);
                if(res.error.code=='ER_DUP_ENTRY'){
                    setError('La cédula introducida ya existe en la base de datos');
                }
                else{
                setError('Ocurrió un error al comunicarse con el servidor');
                console.log(res.error);
                }
            }

        }else {
            setError('Cedula o telefono con formato incorrecto');
        }


    }



    return (

        <div className="flex flex-col items-center justify-center min-h-full">
            <div className="bg-gray-700 p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-dvw max-w-fit transform transition-all duration-300 ">
                <h1 className="text-2xl font-bold text-white mb-8">Registrar Distribuidor</h1>
                <div className="w-full">
                    <form onSubmit={handleSubmit} className="grid relative items-center grid-rows-3 sm:grid-cols-2 gap-5 sm:gap-7 pb-18">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Primer Nombre"
                                value={firstName}
                                onChange={(e) => setFistName(e.target.value)}
                                required
                                className="peer block w-full rounded-md border text-gray-100 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-300 "
                            />
                            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />

                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Segundo Nombre"
                                value={secondFirstName}
                                onChange={(e) => setSecondFistName(e.target.value)}
                                required
                                className="peer block w-full rounded-md border text-gray-100 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-300 "
                            />
                            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />

                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Primer Apellido"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="peer block w-full rounded-md border text-gray-100 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-300"
                            />
                            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Segundo Apellido"
                                value={secondLastName}
                                onChange={(e) => setSecondLastName(e.target.value)}
                                required
                                className="peer block w-full rounded-md border text-gray-100 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-300"
                            />
                            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Cédula   Ej.12345678"
                                min='1000000'
                                max='90000000'
                                value={id}
                                onChange={(e) => setID(e.target.value)}
                                required
                                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none peer block w-full rounded-md border text-gray-100 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-300"
                            />
                            <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Teléfono   Ej.4141234567"
                                value={phoneNumber}
                                min='1000000000'
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none peer block w-full rounded-md border text-gray-100 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-300"
                            />
                            <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />
                        </div>
                        {mensaje && (
                            <Alert severity="success" className={'col-span-2 justify-center'} >
                                {mensaje}
                            </Alert>
                            )
                        }
                        {error && (
                            <Alert severity="error" className={'col-span-2 justify-center'} >
                                {error}
                            </Alert>
                        )
                        }
                        <Button className="mt-1 absolute w-full bottom-0">
                            Registrar <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}