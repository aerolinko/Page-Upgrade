'use client'
import {Box, ToggleButton, ToggleButtonGroup, toggleButtonGroupClasses} from "@mui/material";
import React, {useState} from "react";
import Image from "next/image";
import {white} from "next/dist/lib/picocolors";

export default function InstruccionesPage() {
  const [pagina,setPagina]=useState<string>('1');

  const handleSelectPagina = (
      event: React.MouseEvent<HTMLElement>,
      newSelection: string | null,
  ) => {
    if (newSelection !== null) {
      setPagina(newSelection);
    }
  };


  return (
    <div className="font-sans items-center justify-items-center min-h-full pb-20 gap-16 sm:p-2">

        <main className="flex flex-col bg-white rounded-lg gap-[32px] row-start-2 items-center sm:items-start">
            <ToggleButtonGroup
                className={'flex justify-center bg-gray-300 mx-auto sticky top-10 z-10 mt-10'}
                color="primary"
                sx={{
                    [`& .${toggleButtonGroupClasses.selected}`]: {
                        borderColor: "aliceblue",
                        color: 'black',
                        background:"aliceblue",
                        fontSize: { xs: "10px", lg: "12px" },
                        borderWidth: "2px",
                    },
                    [`& .${toggleButtonGroupClasses.grouped}`]: {
                        color: 'black',
                        fontSize: { xs: "7px", lg: "14px" },
                        borderWidth: "2px",
                    },
                    justifyContent: 'center',
                    marginBottom: '1px'
                }}
                exclusive
                aria-label="Platform"
                onChange={handleSelectPagina}
                value={pagina}
            >
                <ToggleButton value="1">Dashboard</ToggleButton>
                <ToggleButton value="2">Manejo de inventario</ToggleButton>
                <ToggleButton value="3">Manejo de registros</ToggleButton>
                <ToggleButton value="4">Distribuidores</ToggleButton>
                <ToggleButton value="5">Metas</ToggleButton>
            </ToggleButtonGroup>

            { pagina=='1' && (
            <div className="text-black bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">¿Cómo funciona el dashboard?</h1>

                <h2 className="text-2xl font-semibold text-blue-700 mt-6 mb-3">Producción vs ventas</h2>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">En el primer recuadro se muestra una gráfica comparativa entre producción y ventas, la cual permite establecer un periodo de tiempo personalizado; por defecto, muestra los últimos 7 días.</p>

                <div className="flex lg:flex-row flex-col justify-evenly my-6">
                    <Box
                        component={'img'}
                        width={300}
                        height={280}
                        src='/dashboard_1.png'
                        alt="Gráfica producción vs ventas"
                        className=" mb-8 rounded-lg shadow-md border-3 border border-blue-700"
                    ></Box>
                    <Box
                        component={'img'}
                        width={300}
                        height={280}
                        src='/dashboard_2.png'
                        alt="Gráfica producción vs ventas"
                        className="rounded-lg shadow-md border-3 border border-blue-700"
                    />
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed indent-8">Así mismo, se puede establecer que se muestren solo las bolsas de 3kg y/o 6kg.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={290}
                    src='/dashboard_3.png'
                    alt="Producción vs ventas"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />

                <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-3">Historial de movimientos</h2>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">Aquí se pueden observar todos los movimientos registrados hasta la fecha; cuenta con una barra de búsqueda que permite filtrar movimientos específicos, como fechas, horas, cantidad o tipos de movimiento.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={290}
                    src='/dashboard_4.png'
                    alt="Historial de movimientos"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />

                <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-3">Inventario en stock y composición de inventario</h2>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">Estas gráficas permiten ver la cantidad total que hay en stock y cuántas bolsas hay por cada categoría de peso.</p>

                <Box
                    component={'img'}
                    width={500}
                    height={100}
                    src='/dashboard_5.png'
                    alt="Gráfica de inventario en stock y composición de inventario"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />

                <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-3">Ventas por distribuidor</h2>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">Esta gráfica compara las ventas realizadas por cada distribuidor registrado, incluyendo las ventas realizadas por la tienda. Cuenta con filtrado por mes y por categoría de peso de bolsa.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={290}
                    src='/dashboard_6.png'
                    alt="Gráfica producción por distribuidor"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />

                <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-3">Metas mensuales</h2>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">Esta gráfica compara la cantidad de ventas en el mes actual contra la meta de ventas establecida más reciente.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={290}
                    src='/dashboard_7.png'
                    alt="Gráfica de metas mensuales"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />
            </div>
            )}






            { pagina=='2' && (
            <div className="text-black bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">¿Cómo funciona el manejo de inventario?</h1>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">En este apartado contamos con tres botones importantes:</p>

                <Box
                    component={'img'}
                    width={400}
                    height={100}
                    src='/manejoinv_1.png'
                    alt="Manejo de inventario"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />

                <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-3">Manejo de la producción</h2>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">Muestra un formulario para registrar un lote de producción nuevo; para registrar se deberá completar los campos de cantidad, peso y darle a crear. Así mismo, aquí podrá observar el historial de las producciones.</p>

                <Box
                    component={'img'}
                    width={290}
                    height={150}
                    src='/manejoinv_2.png'
                    alt="Formulario de producción"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />

                <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-3">Manejo de las ventas</h2>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">Muestra un formulario para registrar una venta nueva; para registrar se deberá completar los campos de cantidad, peso, código del distribuidor y darle a crear. Así mismo, aquí podrá observar el historial de las ventas.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={160}
                    src='/manejoinv_3.png'
                    alt="Formulario de ventas"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />

                <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-3">Casos especiales</h2>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">Muestra un formulario para registrar un caso especial, por ejemplo, bolsas defectuosas. Para registrar se deberá completar los campos de cantidad, peso, motivo y darle a crear. Así mismo, aquí podrá observar el historial de los casos especiales registrados.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={160}
                    src='/manejoinv_4.png'
                    alt="Formulario de casos especiales"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />
            </div>
            )}


            { pagina=='3' && (
            <div className="text-black bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">¿Cómo funciona el manejo de registros?</h1>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">En este apartado se podrán observar los registros totales. En caso de ser administrador, podrá modificar la información de los registros o eliminar un registro.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={200}
                    src='/manejore_1.png'
                    alt="Tabla de registro de movimientos"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />
            </div>
            )}


            { pagina=='4' && (
            <div className="text-black bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">¿Cómo funciona el manejo de distribuidores?</h1>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">En este apartado se podrán observar los distribuidores registrados. Podrá modificar o eliminar la información de los distribuidores.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={240}
                    src='/distribuidores_1.png'
                    alt="Tabla de distribuidores"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />

                <p className="text-gray-700 mt-6 mb-4 leading-relaxed indent-8">A su vez, se podrá agregar un distribuidor nuevo a los registros. Para ello, deberá llenar el formulario con los datos correspondientes y darle a registrar.</p>

                <Box
                    component={'img'}
                    width={300}
                    height={200}
                    src='/distribuidores_2.png'
                    alt="Formulario de registro de distribuidores"
                    className="rounded-lg shadow-md border-3 border border-blue-700 mx-auto my-4"
                />
            </div>
            )}

            { pagina=='5' && (
            <div className="text-black bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">¿Cómo funcionan las metas?</h1>
                <p className="text-gray-700 mb-4 leading-relaxed indent-8">En este apartado se podrán observar el registro de las metas registradas y si estas fueron alcanzadas o no. A su vez, se podrá registrar una nueva meta llenando un formulario con la cantidad que se quiere alcanzar y el tipo de meta, ya sea de producción o de venta.</p>

                <div className="flex lg:flex-row flex-col justify-evenly my-6">
                    <Box
                        component={'img'}
                        width={300}
                        height={250}
                        src='/metas_1.png'
                        alt="Tabla de metas"
                        className="mb-8 rounded-lg shadow-md border-3 border border-blue-700"
                    />
                    <Box
                        component={'img'}
                        width={300}
                        height={250}
                        src='/metas_2.png'
                        alt="Formulario de metas"
                        className="rounded-lg shadow-lg border-3 border border-blue-700"
                    />
                </div>
            </div>
                )}

        </main>

    </div>
  );
}
