"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    ArrowLeftCircleIcon,
    ArrowRightCircleIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import {redirect} from "next/navigation";
import {format} from "date-fns";

export default function Roles() {
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);

    interface Movimiento {
        fecha_correcta: Date;
        cantidad: number;
        tipodemovimiento:string;
        peso:string;
        hora:string;
        registro_id:number;
    }

    const [data, setData] = useState<Movimiento[]>([])

    async function fetchAllData() {
        const response = await fetch(`/api/data?all=1`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        });
        if (response.ok) {
            const res = await response.json();
            setData(res.data);
        } else {
            forceExpiredLogOut(response);
            setError("Error obteniendo los datos del servidor");
        }

    }

    function forceExpiredLogOut(res: Response) {
        if (res.status === 401) {
            redirect('/');
        }
    }

    const sortedAndFilteredRoles = useMemo(() => {
        let currentRoles = [...data];
        if (filter) {
            const lowerCaseFilter = filter.toLowerCase();
            currentRoles = currentRoles.filter(role =>
                role.tipodemovimiento.toLowerCase().includes(lowerCaseFilter) ||
                role.peso.toLowerCase().includes(lowerCaseFilter) ||
                role.cantidad.toString().includes(lowerCaseFilter) ||
                role.hora.toLowerCase().includes(lowerCaseFilter) ||
                format(role.fecha_correcta,'dd/MM/yyyy').toLowerCase().includes(lowerCaseFilter)
            );
        }
        return currentRoles;
    }, [filter, data]);

    const paginatedRoles = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedAndFilteredRoles.slice(startIndex, endIndex);
    }, [sortedAndFilteredRoles, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(sortedAndFilteredRoles.length / itemsPerPage);
    }, [sortedAndFilteredRoles.length, itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    async function handleEdit(row:Movimiento){
        console.log(row);
    }

    async function handleDelete(row:Movimiento){
        console.log(row);
    }


    useEffect(() => {
        fetchAllData();
    }, []);

    // Manejar el cambio de la entrada de filtro y reiniciar la página a 1
    const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
        setCurrentPage(1); // Reiniciar a la primera página al cambiar el filtro
    }, []);


    return (
        <div className='justify-center flex flex-row items-center mt-20 content-center'>
            <div className="w-full max-w-4xl bg-gray-700 p-6 sm:p-8  rounded-2xl shadow-xl border-2 transform transition-all duration-300">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Manejo de registros</h1>

                {/* Search Input */}
                <div className="relative mb-6 rounded-md shadow-sm">
                    <label htmlFor="search" className="sr-only">Buscar registros</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Buscar registros por tipo, cantidad o fecha..."
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
                                Tipo
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                            >
                                Cantidad
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider  select-none"

                            >
                                Hora
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-gray-400 divide-y divide-gray-700">
                        {paginatedRoles.length > 0 ? (
                            paginatedRoles.map((role) => (
                                <tr key={role.registro_id} className="hover:bg-gray-500 transition-colors">
                                    <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                        {format(role.fecha_correcta,'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                        {role.tipodemovimiento}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                        {role.cantidad}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-black">
                                        {role.hora}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">

                                                <button
                                                    onClick={()=>{handleEdit(role)}}
                                                    className="inline-flex items-center p-2 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                                    aria-label={`Editar ${role.peso}`}
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>


                                                <button
                                                    onClick={()=>{handleDelete(role)}}
                                                    className="inline-flex items-center p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                                    aria-label={`Eliminar ${role.hora}`}
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-black">
                                    No se encontraron movimientos.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

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
        </div>
    );
}
