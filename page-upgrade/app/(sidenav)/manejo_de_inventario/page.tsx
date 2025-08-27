'use client'
import {useState, useEffect} from "react";
import {redirect} from "next/navigation";
import {
  ArrowDownOnSquareIcon, ArrowLeftIcon, ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";
import {Button} from "@/app/ui/button";
import Produccion from "@/app/ui/produccion";
import Venta from "@/app/ui/venta";
import DataTable from "react-data-table-component";
import {format} from "date-fns";

export default function Dashboard() {

  interface Movimiento {
    fecha_correcta: Date;
    cantidad: number;
    tipodemovimiento:string;
    peso:string;
    hora:string;
  }

  const [isProduccion, setIsProduccion] = useState(false);
  const [isVenta, setIsVenta] = useState(false);
  const [filterTextVen, setFilterTextVen] = useState('')
  const [filterTextPro, setFilterTextPro] = useState('')
  const [dataVen, setDataVen] = useState<Movimiento[]>()
  const [dataPro, setDataPro] = useState<Movimiento[]>()
  const [errorPro, setErrorPro] = useState<string>()
  const [errorVen, setErrorVen] = useState<string>()
  const [statePro, setStatePro] = useState<boolean>(true)
  const [stateVen, setStateVen] = useState<boolean>(true)

  const columns = [
    {
      name: 'Fecha',
      selector: (row: Movimiento) => format(new Date(row.fecha_correcta), 'dd/MM/yyyy'),
      sortable: true,
      sortFunction: (rowA: Movimiento, rowB: Movimiento) => {
        const dateA = new Date(rowA.fecha_correcta).getTime();
        const dateB = new Date(rowB.fecha_correcta).getTime();
        return dateA - dateB;
      },
    },
    {
      name: 'Movimiento',
      selector: (row: Movimiento) => row.tipodemovimiento,
      sortable: true,
    },
    {
      name: 'Cantidad',
      selector: (row: Movimiento) => row.cantidad,
      sortable: true,
    },
    {
      name: 'Peso',
      selector: (row: Movimiento) => row.peso,
    },
    {
      name: 'Hora',
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

  function forceExpiredLogOut(res: Response) {
    if (res.status === 401) {
      redirect('/');
    }
  }

  useEffect(() => {
    fetchVenData();
    fetchProData();
  }, []);

  useEffect(() => {
    fetchProData();
  }, [statePro]);

  useEffect(() => {
    fetchVenData();
  }, [stateVen]);

  return (

      <div className="flex flex-col items-center justify-center min-h-full">

        {isProduccion && (
        <main className="flex md:flex-row flex-col w-full items-center justify-center min-h-full">
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
              <div className="flex flex-col xl:ml-10 mt-5 xl:w-[540px] sm:w-[430px] w-[350px] min-h-fit bg-gray-300 rounded-2xl p-1.5 outline-2 outline-blue-900">
                <div className="flex gap-4 text-black  mb-1 mt-1 xl:text-[20px] text-[17px] font-semibold items-center flex-col">
                  <a>
                    Registro completo de Producción
                  </a>
                </div>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={filterTextPro}
                    onChange={(e) => setFilterTextPro(e.target.value)}
                    className="mb-1 p-2 pl-4 border border-gray-300 bg-gray-400 text-black rounded-xl font-bold"
                />
                <DataTable
                    columns={columns}
                    data={dataPro.filter(item =>
                        format(item.fecha_correcta, 'dd/MM/yyyy').includes(filterTextPro.toLowerCase().trim()) ||
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
                          overflowX: 'auto',
                        }
                      },
                      headRow: {
                        style: {
                          backgroundColor: '#99A1AF',
                          fontWeight: 'bold',
                          fontFamily: 'Geist',
                        },
                      },
                      rows: {
                        style: {
                          backgroundColor: '#99A1AF',
                          fontWeight: 'bold',
                          minWidth: '589px',
                        },
                        highlightOnHoverStyle:{
                          backgroundColor: '#D1D5DC',
                        }
                      },
                      pagination: {
                        style: {
                          borderRadius: '15px',
                          color: '#2C2D2E',
                          backgroundColor: '#99A1AF',
                          fontWeight: 'bold',
                          marginTop: '2px',
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
            <main className="flex md:flex-row flex-col w-full items-center justify-center min-h-full">
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
                  <div className="flex flex-col xl:ml-10 mt-5 xl:w-[540px] sm:w-[430px] w-[350px] min-h-fit bg-gray-300 rounded-2xl p-1.5 outline-2 outline-blue-900">
                    <div className="flex gap-4 text-black  mb-1 mt-1 xl:text-[20px] text-[17px] font-semibold items-center flex-col">
                      <a>
                        Registro completo de Ventas
                      </a>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={filterTextVen}
                        onChange={(e) => setFilterTextVen(e.target.value)}
                        className="mb-1 p-2 pl-4 border border-gray-300 bg-gray-400 text-black rounded-xl font-bold"
                    />

                    <DataTable
                        columns={columns}
                        data={dataVen.filter(item =>
                            format(item.fecha_correcta, 'dd/MM/yyyy').includes(filterTextVen.toLowerCase().trim()) ||
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
                              overflowX: 'auto',
                            }
                          },
                          headRow: {
                            style: {
                              backgroundColor: '#99A1AF',
                              fontWeight: 'bold',
                              fontFamily: 'Geist',
                            },
                          },
                          rows: {
                            style: {
                              backgroundColor: '#99A1AF',
                              fontWeight: 'bold',
                              minWidth: '589px',
                            },
                            highlightOnHoverStyle:{
                              backgroundColor: '#D1D5DC',
                            }
                          },
                          pagination: {
                            style: {
                              borderRadius: '15px',
                              color: '#2C2D2E',
                              backgroundColor: '#99A1AF',
                              fontWeight: 'bold',
                              marginTop: '2px',
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



        {!isProduccion && !isVenta && (
      <div className="flex xl:flex-row flex-col w-fit gap-10">

          <div className='group relative flex sm:w-[400px] w-[250px] flex-col items-center justify-center p-6 rounded-xl transition-all duration-300
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

                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">

                </h3>
              </div>

              <p className="text-sm text-gray-200 group-hover:text-blue-500 transition-colors">
                Manejo de la Producción
              </p>
            </div>
          </div>

                <div className='group relative sm:w-[400px] w-[250px] flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300
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

                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">

                      </h3>
                    </div>

                    <p className="text-sm text-gray-200 group-hover:text-blue-500 transition-colors">
                      Manejo de las Ventas
                    </p>
                  </div>
          </div>
      </div>
        )}

    </div>
  );
}
