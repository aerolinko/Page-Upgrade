'use client'
import React, {useState, useEffect} from "react";
import {redirect} from "next/navigation";
import {
  ArrowDownOnSquareIcon, ArrowLeftIcon, ArrowPathRoundedSquareIcon, ArrowUpOnSquareIcon, MagnifyingGlassIcon, TrashIcon,
} from "@heroicons/react/24/outline";
import {Button} from "@/app/ui/button";
import Produccion from "@/app/ui/produccion";
import Venta from "@/app/ui/venta";
import DataTable from "react-data-table-component";
import {format} from "date-fns";
import Special from "@/app/ui/special";

export default function Dashboard() {

  interface Movimiento {
    fecha_correcta: string;
    cantidad: number;
    tipodemovimiento:string;
    peso:string;
    hora:string;
  }

  const [isProduccion, setIsProduccion] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isVenta, setIsVenta] = useState(false);
  const [filterTextVen, setFilterTextVen] = useState('')
  const [filterTextPro, setFilterTextPro] = useState('')
  const [dataVen, setDataVen] = useState<Movimiento[]>()
  const [dataPro, setDataPro] = useState<Movimiento[]>()
  const [dataSpecial, setDataSpecial] = useState<Movimiento[]>()
  const [errorPro, setErrorPro] = useState<string>()
  const [errorVen, setErrorVen] = useState<string>()
  const [errorSpecial, setErrorSpecial] = useState<string>()
  const [statePro, setStatePro] = useState<boolean>(true)
  const [stateVen, setStateVen] = useState<boolean>(true)
  const [stateSpecial, setStateSpecial] = useState<boolean>(true)

    const formatDateGMT4 = (dateString: string): string => {
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + (4 * 60 * 60 * 1000));

        const day = adjustedDate.getUTCDate().toString().padStart(2, '0');
        const month = (adjustedDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = adjustedDate.getUTCFullYear();

        return `${day}/${month}/${year}`;
    };

  const columns = [
    {
      name: 'FECHA',
        selector: (row: Movimiento) => formatDateGMT4(row.fecha_correcta),
      sortable: true,
      sortFunction: (rowA: Movimiento, rowB: Movimiento) => {
        const dateA = new Date(rowA.fecha_correcta).getTime();
        const dateB = new Date(rowB.fecha_correcta).getTime();
        return dateA - dateB;
      },
    },
    {
      name: 'TIPO',
      selector: (row: Movimiento) => row.tipodemovimiento,
      sortable: true,
    },
    {
      name: 'CANTIDAD',
      selector: (row: Movimiento) => row.cantidad,
      sortable: true,
    },
    {
      name: 'PESO',
      selector: (row: Movimiento) => row.peso,
    },
    {
      name: 'HORA',
      selector: (row: Movimiento) => row.hora,
    },
  ]

  async function fetchVenData() {
    const response = await fetch(`/api/data?venta=1`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setDataVen(res.data);
    } else {
      forceExpiredLogOut(response);
      setErrorVen("Error obteniendo los datos del servidor");
    }
  }

  async function fetchProData() {
    const response = await fetch(`/api/data?prod=1`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setDataPro(res.data);
    } else {
      forceExpiredLogOut(response);
      setErrorPro("Error obteniendo los datos del servidor");
    }

  }

  async function fetchSpecialData() {
    const response = await fetch(`/api/data?special=1`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setDataSpecial(res.data);
    } else {
      forceExpiredLogOut(response);
      setErrorSpecial("Error obteniendo los datos del servidor");
    }

  }

  function forceExpiredLogOut(res: Response) {
    if (res.status === 401) {
      redirect('/');
    }
  }

  useEffect(() => {
    fetchVenData();
    fetchProData();
    fetchSpecialData()
  }, []);

  useEffect(() => {
    fetchProData();
  }, [statePro]);

  useEffect(() => {
    fetchVenData();
  }, [stateVen]);

  useEffect(() => {
    fetchSpecialData();
  }, [stateSpecial]);

  return (

      <div className="flex flex-col items-center justify-center min-h-full">

        {isProduccion && (
        <main className="flex mt-5 xl:flex-row flex-col w-full items-center justify-center min-h-full">
        <div className=" m-10 bg-gray-700 p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-[350px]  sm:max-w-sm min-w-xs transform transition-all duration-300 ">
          <Produccion setStatePro={setStatePro} statePro={statePro} />
          <Button onClick={()=>{
            setIsProduccion(false)
          }} className="mt-4 w-fit bg-gray-800 hover:bg-gray-500">
            <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-50" />
            Regresar
          </Button>
        </div>
          {dataPro && dataPro.length > 0 ? (
              <div className="flex flex-col xl:ml-10 mb-10 mt-5 xl:w-[460px] sm:w-[430px] w-[350px] min-h-fit bg-gray-700 rounded-2xl p-1.5 outline-2 outline-white">
                <div className="flex gap-4 text-white  mb-1 mt-1 text-[20px] font-semibold items-center flex-col">
                  <a>
                    Historial de Producción
                  </a>
                </div>
                <div className='relative px-1 mb-3'>
                  <input
                      type="text"
                      placeholder="Buscar..."
                      value={filterTextPro}
                      onChange={(e) => setFilterTextPro(e.target.value)}
                      className="p-2 pl-12 border w-full shadow-md placeholder:text-gray-900 border-gray-300 bg-gray-400 text-black rounded-lg"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2  -translate-y-1/2 h-6 w-6 text-black" />
                </div>
                <DataTable
                    columns={columns}
                    data={dataPro.filter(item =>
                        formatDateGMT4(item.fecha_correcta).includes(filterTextPro.toLowerCase().trim()) ||
                        item.tipodemovimiento.toLowerCase().includes(filterTextPro.toLowerCase().trim()) ||
                        item.cantidad.toString().includes(filterTextPro) || item.hora.toString().trim().includes(filterTextPro.toLowerCase().trim())
                    )}
                    pagination
                    paginationComponentOptions={{
                      rowsPerPageText:"Entradas por página",
                      rangeSeparatorText: 'de',
                    }
                    }
                    paginationPerPage={5}
                    paginationRowsPerPageOptions={[5, 10, 15]}
                    highlightOnHover
                    responsive
                    noDataComponent="No hay datos disponibles"
                    progressPending={!dataPro.length}
                    customStyles={{
                      tableWrapper: {
                        style:{
                          overflowX: 'scroll',
                          border: 'none',
                          boxShadow: 'inherit',
                        }
                      },
                      headRow: {
                        style: {
                          backgroundColor: '#1E2939',
                          fontWeight: 'medium',
                          color: 'white',
                        },
                      },
                      rows: {
                        style: {
                          backgroundColor: '#99A1AF',
                          whiteSpace: 'nowrap',
                          fontWeight: 'medium',
                          minWidth: '557px',
                          border: 'solid 1px',
                        },
                        highlightOnHoverStyle:{
                          backgroundColor: '#D1D5DC',
                        }
                      },
                      pagination: {
                        style: {
                          borderRadius: '15px',
                          color: 'white',
                          backgroundColor: '#1E2939',
                          border: 'solid 1px',
                          marginTop: '5px',
                        },
                        pageButtonsStyle: {
                          fill:"white",
                        },
                      },
                      noData: {
                        style: {
                          backgroundColor: '#99A1AF',
                          fontWeight: 'bold',
                          padding: '10px',
                        }
                      }
                    }
                    }
                />
              </div>
          ) : !errorPro && (
              <p>Cargando tabla...</p>
          )}

        </main>
        )}


        {isVenta && (
            <main className="flex mt-5 sm:mt-0 xl:flex-row flex-col w-full items-center justify-center min-h-full">
            <div className=" m-10 bg-gray-700 p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-[350px]  sm:max-w-sm min-w-xs transform transition-all duration-300 ">
              <Venta stateVen={stateVen} setStateVen={setStateVen} />
              <Button onClick={()=>{
                setIsVenta(false)
              }} className="mt-4 w-fit bg-gray-800 hover:bg-gray-500">
                <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-50" />
                Regresar
              </Button>
            </div>
              {dataVen && dataVen.length > 0 ? (
                  <div className="flex flex-col xl:ml-10 mb-10 mt-5 xl:w-[460px] sm:w-[430px] w-[350px] min-h-fit bg-gray-700 rounded-2xl p-1.5 outline-2 outline-white">
                    <div className="flex gap-4 text-white  mb-1 mt-1 text-[20px] font-semibold items-center flex-col">
                      <a>
                        Historial de Ventas
                      </a>
                    </div>
                    <div className='relative px-1 mb-3'>
                      <input
                          type="text"
                          placeholder="Buscar..."
                          value={filterTextVen}
                          onChange={(e) => setFilterTextVen(e.target.value)}
                          className="p-2 pl-12 border w-full shadow-md placeholder:text-gray-900 border-gray-300 bg-gray-400 text-black rounded-lg"
                      />
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2  -translate-y-1/2 h-6 w-6 text-black" />
                    </div>
                    <DataTable
                        columns={columns}
                        data={dataVen.filter(item =>
                            formatDateGMT4(item.fecha_correcta).includes(filterTextVen.toLowerCase().trim()) ||
                            item.tipodemovimiento.toLowerCase().includes(filterTextVen.toLowerCase().trim()) ||
                            item.cantidad.toString().includes(filterTextVen) || item.hora.toString().trim().includes(filterTextVen.toLowerCase().trim())
                        )}
                        pagination
                        paginationComponentOptions={{
                          rowsPerPageText:"Entradas por página",
                          rangeSeparatorText: 'de',
                        }
                        }
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 10, 15]}
                        highlightOnHover
                        responsive
                        noDataComponent="No hay datos disponibles"
                        progressPending={!dataVen.length}
                        customStyles={{
                          tableWrapper: {
                            style:{
                              overflowX: 'scroll',
                              border: 'none',
                              boxShadow: 'inherit',
                            }
                          },
                          headRow: {
                            style: {
                              backgroundColor: '#1E2939',
                              fontWeight: 'medium',
                              color: 'white',
                            },
                          },
                          rows: {
                            style: {
                              backgroundColor: '#99A1AF',
                              whiteSpace: 'nowrap',
                              fontWeight: 'medium',
                              minWidth: '557px',
                              border: 'solid 1px',
                            },
                            highlightOnHoverStyle:{
                              backgroundColor: '#D1D5DC',
                            }
                          },
                          pagination: {
                            style: {
                              borderRadius: '15px',
                              color: 'white',
                              backgroundColor: '#1E2939',
                              border: 'solid 1px',
                              marginTop: '5px',
                            },
                            pageButtonsStyle: {
                              fill:"white",
                            },
                          },
                          noData: {
                            style: {
                              backgroundColor: '#99A1AF',
                              fontWeight: 'bold',
                              padding: '10px',
                            }
                          }
                        }
                        }
                    />
                  </div>
              ) : !errorVen && (
                  <p>Cargando tabla...</p>
              )}
            </main>
        )}


        {isSpecial && (
            <main className="flex mt-5 sm:mt-0 xl:flex-row flex-col w-full items-center justify-center min-h-full">
              <div className=" m-10 bg-gray-700 p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-[350px]  sm:max-w-sm min-w-xs transform transition-all duration-300 ">
                <Special stateSpecial={stateSpecial} setStateSpecial={setStateSpecial} />
                <Button onClick={()=>{
                  setIsSpecial(false)
                }} className="mt-4 w-fit bg-gray-800 hover:bg-gray-500">
                  <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-50" />
                  Regresar
                </Button>
              </div>
              {dataSpecial ? (
                  <div className="flex flex-col xl:ml-10 mb-10 mt-5 xl:w-[460px] sm:w-[430px] w-[350px] min-h-fit bg-gray-700 rounded-2xl p-1.5 outline-2 outline-white">
                    <div className="flex gap-4 text-white  mb-1 mt-1 text-[20px] font-semibold items-center flex-col">
                      <a>
                        Historial de Casos Especiales
                      </a>
                    </div>
                    <div className='relative px-1 mb-3'>
                      <input
                          type="text"
                          placeholder="Buscar..."
                          value={filterTextVen}
                          onChange={(e) => setFilterTextVen(e.target.value)}
                          className="p-2 pl-12 border w-full shadow-md placeholder:text-gray-900 border-gray-300 bg-gray-400 text-black rounded-lg"
                      />
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2  -translate-y-1/2 h-6 w-6 text-black" />
                    </div>
                    <DataTable
                        columns={columns}
                        data={dataSpecial.filter(item =>
                            formatDateGMT4(item.fecha_correcta).includes(filterTextVen.toLowerCase().trim()) ||
                            item.tipodemovimiento.toLowerCase().includes(filterTextVen.toLowerCase().trim()) ||
                            item.cantidad.toString().includes(filterTextVen) || item.hora.toString().trim().includes(filterTextVen.toLowerCase().trim())
                        )}
                        pagination
                        paginationComponentOptions={{
                          rowsPerPageText:"Entradas por página",
                          rangeSeparatorText: 'de',
                        }
                        }
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 10, 15]}
                        highlightOnHover
                        responsive
                        noDataComponent="No hay datos disponibles"
                        customStyles={{
                          tableWrapper: {
                            style:{
                              overflowX: 'scroll',
                              border: 'none',
                              boxShadow: 'inherit',
                            }
                          },
                          headRow: {
                            style: {
                              backgroundColor: '#1E2939',
                              fontWeight: 'medium',
                              color: 'white',
                            },
                          },
                          rows: {
                            style: {
                              backgroundColor: '#99A1AF',
                              whiteSpace: 'nowrap',
                              fontWeight: 'medium',
                              minWidth: '693px',
                              border: 'solid 1px',
                            },
                            highlightOnHoverStyle:{
                              backgroundColor: '#D1D5DC',
                            }
                          },
                          pagination: {
                            style: {
                              borderRadius: '15px',
                              color: 'white',
                              backgroundColor: '#1E2939',
                              border: 'solid 1px',
                              marginTop: '5px',
                            },
                            pageButtonsStyle: {
                              fill:"white",
                            },
                          },
                          noData: {
                            style: {
                              backgroundColor: '#99A1AF',
                              fontWeight: 'bold',
                              padding: '10px',
                            }
                          }
                        }
                        }
                    />
                  </div>
              ) : !errorSpecial && (
                  <p>Cargando tabla...</p>
              )}
            </main>
        )}


        {!isProduccion && !isVenta && !isSpecial && (
      <div className="flex xl:flex-row flex-col w-fit gap-10">

          <div className='group relative flex 2xl:w-[400px] sm:w-[300px] w-[280px] flex-col items-center justify-center p-6 rounded-xl transition-all duration-300
           bg-gray-700 border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-500 hover:bg-blue-50
             h-full min-h-[180px] cursor-pointer'
               onClick={()=>{
                 setIsProduccion(true);
               }}
          >
            <div className='absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100
                 transition-opacity duration-300' />
            <div className="flex flex-col items-center justify-between gap-3">
              <div className="flex flex-col items-center gap-3">
                <div className='p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300'>
                  <ArrowDownOnSquareIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-50 group-hover:text-blue-600 transition-colors">
                  Manejo de la Producción
                </h3>
              </div>

              <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors">
                Manejo de la Producción de las bolsas de hielo
              </p>
            </div>
          </div>

                <div className='group relative 2xl:w-[400px] sm:w-[300px] w-[280px] flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300
           bg-gray-700 border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-500 hover:bg-blue-50
             h-full min-h-[180px] cursor-pointer'
                     onClick={()=>{
                       setIsVenta(true);
                     }}
                >
                  <div className='absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100
                 transition-opacity duration-300' />
                  <div className="flex flex-col items-center justify-between gap-3">
                    <div className="flex flex-col items-center gap-3">
                      <div className='p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300'>
                        <ArrowUpOnSquareIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-50 group-hover:text-blue-600 transition-colors">
                        Manejo de las Ventas
                      </h3>
                    </div>
                    <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors">
                      Manejo de las Ventas por tienda y distribuidores
                    </p>
                  </div>
          </div>
        <div className='group relative flex 2xl:w-[400px] sm:w-[300px] w-[280px] flex-col items-center justify-center p-6 rounded-xl transition-all duration-300
           bg-gray-700 border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-500 hover:bg-blue-50
             h-full min-h-[180px] cursor-pointer'
             onClick={()=>{
               setIsSpecial(true);
             }}
        >
          <div className='absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100
                 transition-opacity duration-300' />
          <div className="flex flex-col items-center justify-between gap-3">
            <div className="flex flex-col items-center gap-3">
              <div className='p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300'>
                <ArrowPathRoundedSquareIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-50 group-hover:text-blue-600 transition-colors">
                Casos Especiales
              </h3>
            </div>

            <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors">
              Bolsas de hielo defectuosas o regaladas
            </p>
          </div>
        </div>


      </div>
        )}

    </div>
  );
}
