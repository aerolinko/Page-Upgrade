"use client";

import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {
    ArrowLeftCircleIcon, ArrowLeftIcon, ArrowRightCircleIcon,
    CheckIcon,
    IdentificationIcon,
    KeyIcon,
    MagnifyingGlassIcon, PencilIcon,
    PhoneIcon, TrashIcon,
    UserIcon, UserPlusIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import {ArrowRightIcon} from "@heroicons/react/20/solid";
import {Button} from "@/app/ui/button";
import {redirect} from "next/navigation";
import {Alert, MenuItem, Select} from "@mui/material";
import {format} from "date-fns";



export default function LoginPage() {
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [firstName, setFistName] = useState("");
    const [lastName, setLastName] = useState("");
    const [secondFirstName, setSecondFistName] = useState("");
    const [secondLastName, setSecondLastName] = useState("");
    const [id, setID] = useState("");
    const [editingId, setEditingId] = useState<number>(0);
    const [editingFirstName, setEditingFistName] = useState<string>('');
    const [editingLastName, setEditingLastName] = useState<string>('');
    const [editingState, setEditingState] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [data, setData] = useState<Distribuidor[]>([])
    const [rol, setRol] = useState<string | null>(null);
    const [createSelected, setCreateSelected] = useState<boolean>(false);

    interface Distribuidor {
        primer_nombre:string;
        primer_apellido:string;
        segundo_nombre?:string;
        segundo_apellido?:string;
        fecha_contrato:Date;
        distribuidor_id:number;
        cedula:number;
        telefono?:string;
        activo:string;
    }

    function forceExpiredLogOut(res: Response) {
        if (res.status === 401) {
            redirect('/');
        }
    }

    async function checkNotAllowed(res: Response) {
        if (res.status === 403) {
            setError("No posees los permisos para realizar esa operación");
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
    }

    async function fetchAllDistData() {
        const response = await fetch(`/api/distribuidor?all=1`, {
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

    async function getSession(){
        const response = await fetch(`/api/session`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });
        if (response.ok) {
            const res = await response.json();
            setRol(res.session.payload.rol);
        } else {
            setError("Error obteniendo las credenciales del usuario");
            forceExpiredLogOut(response);
            await checkNotAllowed(response);
        }
    }

    const sortedAndFilteredRoles = useMemo(() => {
        let currentRoles = [...data];
        if (filter) {
            const lowerCaseFilter = filter.toLowerCase();
            currentRoles = currentRoles.filter(role =>
                role.primer_nombre.toLowerCase().includes(lowerCaseFilter) ||
                role.primer_apellido.toLowerCase().includes(lowerCaseFilter) ||
                role.cedula.toString().includes(lowerCaseFilter) ||
                role.segundo_nombre?.toLowerCase().includes(lowerCaseFilter) ||
                role.segundo_apellido?.toLowerCase().includes(lowerCaseFilter) ||
                format(role.fecha_contrato,'dd/MM/yyyy').toLowerCase().includes(lowerCaseFilter)
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
        fetchAllDistData();
        getSession();
    }, []);

    async function handleEdit(row:Distribuidor){
        setEditingId(row.distribuidor_id);
        setEditingFistName(row.primer_nombre);
        setEditingLastName(row.primer_apellido);
        setEditingState(row.activo);
    }

    async function resetEdit(){
        setEditingId(0);
        setEditingFistName('');
        setEditingLastName('');
        setEditingState('');
    }

    async function handleCancelEdit(){
        await resetEdit();
    }

    async function handleConfirmEdit(){
        const response = await fetch(`/api/distribuidor`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ editingId, editingState, editingFirstName, editingLastName })
        });
        if (response.ok) {
            const res = await response.json();
            await fetchAllDistData();
            await resetEdit();
        } else {
            setError("Error editando los datos en el servidor");
            forceExpiredLogOut(response);
            await checkNotAllowed(response);
        }
    }

    async function handleDelete(row:Distribuidor){
        const response = await fetch(`/api/distribuidor?id=${row.distribuidor_id}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
        });
        if (response.ok) {
            const res = await response.json();
        } else {
            setError("Error eliminando los datos del servidor");
            forceExpiredLogOut(response);
            await checkNotAllowed(response);
        }
    }

    async function handleSetID(e:ChangeEvent<HTMLInputElement>){
        if(e.target.value.match('^[1-9][0-9]*$')||e.target.value==''){
            setID(e.target.value);
        }
    }

    async function handleSetPhone(e:ChangeEvent<HTMLInputElement>){
        if(e.target.value.match('^[0][0-9]*$')||e.target.value==''){
            setPhoneNumber(e.target.value);
        }
    }

    return (

        <div className="flex flex-col items-center justify-center min-h-full">
            {createSelected ? (
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
                                type="text"
                                placeholder="Cédula   Ej.12345678"
                                value={id}
                                maxLength={8}
                                minLength={7}
                                onChange={(e) => handleSetID(e)}
                                required
                                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none peer block w-full rounded-md border text-gray-100 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-300"
                            />
                            <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Teléfono   Ej.04141234567"
                                value={phoneNumber}
                                maxLength={11}
                                minLength={11}
                                onChange={(e) => handleSetPhone(e)}
                                required
                                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none peer block w-full rounded-md border text-gray-100 border-gray-300 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-300"
                            />
                            <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 peer-focus:text-gray-100" />
                        </div>
                        {mensaje && (
                            <Alert severity="success" className={'sm:col-span-2 justify-center'} >
                                {mensaje}
                            </Alert>
                            )
                        }
                        {error && (
                            <Alert severity="error" className={'sm:col-span-2 justify-center'} >
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
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Manejo de Distribuidores</h1>
                {/* Search Input */}
                <div className="relative mb-6 rounded-md shadow-sm">
                    <label htmlFor="search" className="sr-only">Buscar registros</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Buscar distribuidores por nombre, apellido o cedula..."
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
                                Nombre
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                            >
                                Apellido
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                            >
                                Cédula
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                            >
                                Fecha Contrato
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                            >
                                Teléfono
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                            >
                                Estado
                            </th>
                            {rol && (rol=='admin' || rol=='presidente') ? (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Acciones
                                </th>
                            ):(
                                <></>
                            )
                            }
                        </tr>
                        </thead>
                        <tbody className="bg-gray-400 divide-y divide-gray-700">
                        {paginatedRoles.length > 0 ? (
                            paginatedRoles.map((role) => (
                                <tr key={role.distribuidor_id} className="hover:bg-gray-500 transition-colors">
                                    <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                        {editingId === role.distribuidor_id ? (
                                            <input
                                                value={editingFirstName}
                                                type="text"
                                                className="peer block w-[100px] rounded-md border  py-[9px] px-2  text-sm"
                                                onChange={(e)=>
                                                    setEditingFistName(e.target.value)
                                                }
                                            />
                                        ) : (role.primer_nombre)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                        {editingId === role.distribuidor_id ? (

                                            <input
                                                type="text"
                                                className="peer block w-[100px] rounded-md border  py-[9px] px-2  text-sm"
                                                value={editingLastName}
                                                onChange={(e)=>
                                                    setEditingLastName(e.target.value)
                                                }
                                            />
                                        ) : (role.primer_apellido)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                        {role.cedula}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                        {format(role.fecha_contrato,'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                        {role.telefono}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                        {editingId === role.distribuidor_id ? (

                                            <Select
                                                className='w-[120px]'
                                                sx={{fontSize:'14px', borderRadius:'10px'}}
                                                value={editingState}
                                                onChange={(e)=>
                                                    setEditingState(e.target.value)
                                                }
                                            >
                                                <MenuItem value={'1'}>Activo</MenuItem>
                                                <MenuItem value={'0'}>Inactivo</MenuItem>
                                            </Select>
                                        ) : role.activo ? 'Activo' : 'Inactivo'}

                                    </td>
                                    {editingId==role.distribuidor_id ? (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={()=>{handleConfirmEdit()}}
                                                    className="inline-flex items-center p-2 rounded-full text-green-600 hover:text-green-900 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"

                                                >
                                                    <CheckIcon className="h-6 w-6" />
                                                </button>
                                                <button
                                                    onClick={()=>{handleCancelEdit()}}
                                                    className="inline-flex items-center p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"

                                                >
                                                    <XMarkIcon className="h-6 w-6" />
                                                </button>
                                            </div>
                                        </td>
                                    ) : (rol && (rol=='admin' || rol=='presidente') ? (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={()=>{handleEdit(role)}}
                                                        className="inline-flex items-center p-2 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"

                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={()=>{handleDelete(role)}}
                                                        className="inline-flex items-center p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"

                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        ):(
                                            <>
                                            </>
                                        )
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-black">
                                    No se encontraron distribuidores.
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
                    <UserPlusIcon className='w-5 h-5 mr-1'/>
                    Añadir un distribuidor
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