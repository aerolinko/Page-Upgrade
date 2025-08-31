"use client";

import React, { useCallback, useEffect, useMemo, useState} from "react";
import {
    ArrowLeftCircleIcon, ArrowLeftIcon, ArrowRightCircleIcon, ChartBarIcon, CheckCircleIcon, CheckIcon,
    MagnifyingGlassIcon, PlusIcon, XCircleIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import {ArrowRightIcon} from "@heroicons/react/20/solid";
import {Button} from "@/app/ui/button";
import {redirect} from "next/navigation";
import {Alert, Chip, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {format} from "date-fns";




export default function LoginPage() {
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [data, setData] = useState<Goal[]>([])
    const [createSelected, setCreateSelected] = useState<boolean>(false);
    const [goalType, setGoalType] = useState<string>('');
    const [goalAmount, setGoalAmount] = useState<string>('');

    interface Goal {
        meta_id:number;
        meta:number;
        fecha_creacion:Date;
        alcanzada:boolean;
        tipo:string;
    }

    function forceExpiredLogOut(res: Response) {
        if (res.status === 401) {
            redirect('/');
        }
    }

    function reset() {
        setError('');
        setGoalAmount('');
        setGoalType('');
    }

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        const response = await fetch(`/api/meta`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ goalAmount, goalType}),
        });
        if (response.ok) {
            const res = await response.json();
            reset();
            setMensaje('Meta registrada exitosamente.');
            setTimeout(() =>{setMensaje('')},5000)
        } else {
            const res = await response.json();
            forceExpiredLogOut(response);
            console.log(res.error.code);
            setError('Ocurrió un error al comunicarse con el servidor');
            console.log(res.error);
        }
    }

    async function fetchAllGoalData() {
        const response = await fetch(`/api/meta?all=1`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });
        if (response.ok) {
            const res = await response.json();
            setData(res.data);
            console.log(res.data)
        } else {
            forceExpiredLogOut(response);
            setError("Error obteniendo los datos del servidor");
        }

    }

    const sortedAndFilteredRoles = useMemo(() => {
        let currentRoles = [...data];
        if (filter) {
            const lowerCaseFilter = filter.toLowerCase();
            currentRoles = currentRoles.filter(role =>
                role.tipo.toLowerCase().includes(lowerCaseFilter) ||
                role.meta.toString().includes(lowerCaseFilter) ||
               (role.alcanzada ? 'si'.includes(lowerCaseFilter) : 'no'.includes(lowerCaseFilter)) ||
                format(role.fecha_creacion,'dd/MM/yyyy').toLowerCase().includes(lowerCaseFilter)
            );
        }
        return currentRoles;
    }, [filter, data]);

    const paginatedRoles = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedAndFilteredRoles.slice(startIndex, endIndex);
    }, [sortedAndFilteredRoles, currentPage, itemsPerPage]);

    const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
        setCurrentPage(1); // Reiniciar a la primera página al cambiar el filtro
    }, []);

    const totalPages = useMemo(() => {
        return Math.ceil(sortedAndFilteredRoles.length / itemsPerPage);
    }, [sortedAndFilteredRoles.length, itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    useEffect(() => {
        fetchAllGoalData();
    }, []);

    return (

        <div className="flex flex-col items-center justify-center mt-15 min-h-full">
            {createSelected ? (
                <div className="bg-gray-700 p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-dvw max-w-fit transform transition-all duration-300 ">
                    <h1 className="text-2xl font-bold text-white mb-8">Registrar Meta Mensual</h1>
                    <div className="w-full">
                        <form onSubmit={handleSubmit} className="grid relative items-center gap-5 sm:gap-7 pb-18">
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    value={goalAmount}
                                    min={1}
                                    onChange={(e)=>setGoalAmount(e.target.value)}
                                    onClick={()=>{if(goalAmount=='0'){
                                    setGoalAmount('')
                                    }
                                    }}
                                    onBlur={()=>{if(goalAmount==''){
                                        setGoalAmount('0')
                                    }
                                    }}
                                    required
                                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none peer block w-full rounded-lg border text-gray-100 border-gray-300 py-3.5 pl-10 text-sm outline-2 placeholder:text-gray-300 "
                                />
                                <ChartBarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />

                            </div>
                            <div className="relative">
                                <FormControl fullWidth>
                                    <InputLabel id="select-label" sx={{color:'white'}}>Tipo</InputLabel>
                                    <Select
                                        labelId="select-label"
                                        id="select"
                                        label="Tipo"
                                        sx={{color:'white',stroke:'white'}}
                                        variant={'outlined'}
                                        value={goalType}
                                        onChange={(e)=>setGoalType(e.target.value)}
                                    >
                                        <MenuItem value={'Produccion'}>Produccion</MenuItem>
                                        <MenuItem value={'Venta'}>Venta</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            {mensaje && (
                                <Alert severity="success" className={'justify-center'} >
                                    {mensaje}
                                </Alert>
                            )
                            }
                            {error && (
                                <Alert severity="error" className={'justify-center'} >
                                    {error}
                                </Alert>
                            )
                            }
                            <Button className="mt-1 absolute right-0 bottom-0">
                                Registrar <ArrowRightIcon className="ml-2 h-5 w-5 text-gray-50" />
                            </Button>
                            <Button
                                onClick={()=>{
                                    setCreateSelected(false);
                                    reset();
                                }} className="absolute bottom-0 bg-gray-800 hover:bg-gray-500">
                                <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-50" />
                                Regresar
                            </Button>
                        </form>
                    </div>

                </div>

            ):(

                <div className="relative w-full max-w-4xl bg-gray-700 p-6 sm:p-8  rounded-2xl shadow-xl border-2 transform transition-all duration-300">
                    <h1 className="text-3xl font-bold text-white mb-6 text-center">Manejo de Metas Mensuales</h1>
                    {/* Search Input */}
                    <div className="relative mb-6 rounded-md shadow-sm">
                        <label htmlFor="search" className="sr-only">Buscar registros</label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Buscar metas por fecha, cantidad, tipo o estado..."
                            value={filter}
                            onChange={handleFilterChange}
                            className="block w-full bg-gray-400  rounded-md border border-gray-300 py-3 pl-12 pr-4 text-black placeholder:text-gray-900 focus:border-blue-300 text-base outline-none transition-colors"
                        />
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-black" />
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}

                    {mensaje && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                            <span className="block sm:inline"> {mensaje}</span>
                        </div>
                    )}

                    {/* Roles Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                        <table className="min-w-full divide-y  divide-gray-200">
                            <thead className="bg-gray-800">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                                >
                                    Fecha
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                                >
                                    Meta
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                                >
                                    Tipo
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                                >
                                    Alcanzada
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-gray-400 divide-y divide-gray-700">
                            {paginatedRoles.length > 0 ? (
                                paginatedRoles.map((role) => (
                                    <tr key={role.meta_id} className="hover:bg-gray-500 transition-colors">
                                        <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                            {format(role.fecha_creacion,'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                            {role.meta}
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                            {role.tipo}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-black`}>
                                            <Chip variant={'filled'} className={'w-[70px] '} color={role.alcanzada ? 'success' : 'error'} icon={role.alcanzada ? <CheckCircleIcon className={'w-5 h-5'}/> : <XCircleIcon className={'w-5 h-5'}/>} label={role.alcanzada ? 'Si':'No'} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-black">
                                        No se encontraron metas.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                    </div>
                    <Button className='w-full mt-5 sm:py-7 justify-center sm:text-[15px] rounded-md border border-gray-400 bg-gray-600 text-white hover:bg-gray-500 '
                            onClick={()=>
                                setCreateSelected(true)
                            }>
                        <PlusIcon className='w-5 h-5 mr-1'/>
                        Añadir una nueva meta mensual
                    </Button>
                    {/* Pagination Controls */}
                    <nav
                        className="flex items-center justify-between border-t border-gray-200 bg-gray px-4 py-3 sm:px-6 mt-6 rounded-b-lg"
                        aria-label="Paginación"
                    >
                        <div className="hidden sm:block">
                            <p className="text-sm text-white">
                                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                                <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedAndFilteredRoles.length)}</span> de{' '}
                                <span className="font-medium">{sortedAndFilteredRoles.length}</span> resultados
                            </p>
                        </div>
                        <div className="flex flex-1 justify-between sm:justify-end">

                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative sm:inline-flex hidden items-center rounded-md border border-gray-300 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-500 transition-colors
                                ${ currentPage === 1 ? "cursor-not-allowed opacity-50" : ''}`}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`relative ml-3 hidden  sm:inline-flex items-center rounded-md border border-gray-300 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-500 transition-colors 
                            ${(currentPage === totalPages || totalPages === 0) ? "cursor-not-allowed opacity-50":''}`}
                            >
                                Siguiente
                            </button>


                            {/*de telefono*/}

                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex mr-1 sm:hidden items-center rounded-md border border-gray-300 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-500 transition-colors
                                ${ currentPage === 1 ? "cursor-not-allowed opacity-50" : ''}`}
                            >
                                <ArrowLeftCircleIcon className="h-7 w-7" />
                            </button>
                            <div className="sm:hidden justify-center content-center text-center">
                                <p className="text-sm text-white">
                                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedAndFilteredRoles.length)}</span> de{' '}
                                    <span className="font-medium">{sortedAndFilteredRoles.length}</span> resultados
                                </p>
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`relative ml-1 inline-flex sm:hidden items-center rounded-md border border-gray-300 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-500 transition-colors 
                            ${(currentPage === totalPages || totalPages === 0) ? "cursor-not-allowed opacity-50":''}`}
                            >
                                <ArrowRightCircleIcon className="h-7 w-7" />
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </div>
    );
}