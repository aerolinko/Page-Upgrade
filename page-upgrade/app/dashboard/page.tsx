'use client'
import {BarChart} from "@mui/x-charts";
import {useState, useEffect} from "react";
import {format} from "date-fns";
import {es} from "date-fns/locale/es";
import DataTable from "react-data-table-component";

export default function Dashboard() {
  interface Data {
    produccion: number;
    fecha_correcta: Date;
    venta: number;
  };

  interface Movimiento {
    fecha_correcta: Date;
    cantidad: number;
    tipodemovimiento:string;
    peso:string;
  }

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>();
  const [data, setData] = useState<Movimiento[]>()
  const [inicio, setInicio] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [fin, setFin] = useState<string>(format(Date.now() - 7*60*60*24*1000,'yyyy-MM-dd'))
  const [dataAmountVen, setDataAmountVen] = useState<number[]>();
  const [dataTime, setDataTime] = useState<Date[]>();
  const [dataAmountPro, setDataAmountPro] = useState<number[]>();
  const [filterText, setFilterText] = useState('');

 const columns = [
   {
     name: 'Fecha',
     selector: (row: Movimiento) => format(new Date(row.fecha_correcta), 'dd/MM/yyyy'),
     sortable: true,
   },
   {
     name: 'Movimiento',
     selector: (row: Movimiento) => row.tipodemovimiento,
     sortable: true,
   },
   {
     name: 'Peso',
     selector: (row: Movimiento) => row.peso,
   },
   {
     name: 'Cantidad',
     selector: (row: Movimiento) => row.cantidad,
     sortable: true,
   }
 ]

  async function fetchData() {
    const response = await fetch(`/api/data?inicio=${inicio}&fin=${fin}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setDataAmountVen(res.data.map((p: Data) => p.produccion));
      setDataTime(res.data.map((p: Data) => p.fecha_correcta));
      setDataAmountPro(res.data.map( (p:Data) =>p.venta));
    } else {
      setError("Error obteniendo los datos del servidor");
    }

  }

  async function fetchAllData() {
    const response = await fetch(`/api/data?all=1`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setData(res.data);
    } else {
      setError("Error obteniendo los datos del servidor");
    }

  }


  useEffect(() => {
    fetchData();
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [inicio,fin]);
  return (
    <div className=" font-sans items-center justify-items-center min-h-full pb-20 gap-16 sm:p-2 ">
      <main className="mt-15 sm:mt-10 grid xl:grid-cols-2 grid-rows-1 grid-cols-1 items-center gap-10 bg-gradient-to-bl rounded-2xl">

        {error && (
            <div className="flex gap-4 items-center flex-col sm:flex-row text-red-500">
              <a>
                {error}
              </a>
            </div>
        )
        }

        {dataTime && dataAmountPro && dataAmountVen ? (
            <div className="flex flex-col w-full h-full bg-gray-300 rounded-2xl p-1 outline-2 outline-blue-900">
              <BarChart
                  xAxis={[{
                    data: dataTime,
                    scaleType: 'band',
                    valueFormatter: (date) => format(date, 'MMM dd',{ locale: es })
                        .replace(/(\b\w)/g, (match) => match.toUpperCase())
                  }]}
                  series={[{
                    data: dataAmountPro,
                    label: 'Producción',
                    color: '#1565c0',
                  },
                    {
                      data: dataAmountVen,
                      label: 'Ventas',
                      color: '#d32f2f',
                    }]}
                  className=" min-w-full min-h-[300px] max-h-[300px]"/>

              <div className="flex flex-col sm:flex-row items-start gap-2 mr-2">
              <div className="flex p-2 ml-1 text-black w-full  justify-between bg-[#99A1AF] border-gray-900 rounded-lg sm:w-[230px]">
                <label className="ml-1 font-medium" htmlFor="fin">Desde</label>
                <input className="ml-1" id='fin' name='fin' value={fin} type='date'
                       onChange={(e) => setFin(e.target.value)}/>
              </div>
              <div className="flex p-2 ml-1 text-black mb-2 w-full bg-[#99A1AF] justify-between border-gray-900 rounded-lg sm:w-[230px]">
                <label className="ml-1 font-medium" htmlFor="inicio">Hasta</label>
                <input className="ml-1" id='inicio' name='inicio' value={inicio} type='date' onChange={(e) => setInicio(e.target.value)}/></div>
              </div>
            </div>

        ) : !error && (
            <p>Cargando gráficas...</p>
        )}


          {data && data.length > 0 ? (
              <div className="flex flex-col max-w-full bg-gray-300 rounded-2xl p-1.5 outline-2 outline-blue-900">
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="mb-1 p-2 pl-4 border border-gray-300 bg-gray-400 text-black rounded-xl font-bold"
                />

              <DataTable
                  columns={columns}
                  data={data.filter(item =>
                      format(item.fecha_correcta, 'dd/MM/yyyy').includes(filterText.toLowerCase().trim()) ||
                      item.tipodemovimiento.toLowerCase().includes(filterText.toLowerCase().trim()) ||
                      item.cantidad.toString().includes(filterText)
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
                  progressPending={!data.length}
                  customStyles={{
                    headRow: {
                      style: {
                        backgroundColor: '#99A1AF',
                        fontWeight: 'bold',
                      },
                    },
                    rows: {
                      style: {
                        backgroundColor: '#99A1AF',
                        fontWeight: 'bold',
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
                      }
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
          ) : !error && (
              <p>Cargando tabla...</p>
          )}

        <div className="w-full bg-blue-900 h-[300px] rounded-2xl p-1 outline-2 outline-blue-900">
        </div>
        <div className="w-full bg-blue-900 h-[300px] rounded-2xl p-1 outline-2 outline-blue-900">
        </div>


      </main>
    </div>
  );
}
