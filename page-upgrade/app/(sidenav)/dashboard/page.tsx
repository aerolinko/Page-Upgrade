'use client'
import {
  BarChart,
  barClasses,
  barElementClasses,
  barLabelClasses,
  Gauge,
  gaugeClasses,
  labelMarkClasses,
  pieArcLabelClasses,
  PieChart
} from "@mui/x-charts";
import {useState, useEffect} from "react";
import {format} from "date-fns";
import {es} from "date-fns/locale/es";
import DataTable from "react-data-table-component";
import {redirect} from "next/navigation";

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
    hora:string;
  }

  interface StockComponent {
    peso_3kg: number;
    peso_6kg: number;
  }

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>();
  const [data, setData] = useState<Movimiento[]>()
  const [stock, setStock] = useState<number>(0)
  const [stockMax, setStockMax] = useState<number>(0)
  const [stockComponents, setStockComponents] = useState<StockComponent>()
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

  async function fetchData() {
    const response = await fetch(`/api/data?inicio=${inicio}&fin=${fin}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setDataAmountPro(res.data.map((p: Data) => p.produccion));
      setDataTime(res.data.map((p: Data) => p.fecha_correcta));
      setDataAmountVen(res.data.map( (p:Data) =>p.venta));
    } else {
      forceExpiredLogOut(response);
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
      forceExpiredLogOut(response);
      setError("Error obteniendo los datos del servidor");
    }

  }

  async function fetchStock() {
    const response = await fetch(`/api/data?stock=1`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setStock(Number.parseFloat(res.data[0].inventario));
      if(Number.parseFloat(res.data[0].inventario) > 20000){
        setStockMax(Number.parseFloat(res.data[0].inventario));
      }
      else{
        setStockMax(20000);
      }
    } else {
      forceExpiredLogOut(response);
      setError("Error obteniendo los datos del servidor");
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

  function forceExpiredLogOut(res: Response) {
   if (res.status === 401) {
     redirect('/');
   }
  }

  useEffect(() => {
    fetchData();
    fetchAllData();
    fetchStock();
    fetchStockComponents();
  }, []);

  useEffect(() => {
    fetchData();
  }, [inicio,fin]);
  return (
    <div className=" font-sans items-center justify-items-center min-h-full pb-20 gap-16 sm:p-2 ">
      <main className="mt-15 sm:mt-10 grid xl:grid-cols-2 grid-rows-1 grid-cols-1 items-center gap-10 rounded-2xl">

        {error && (
            <div className="flex gap-4 items-center flex-col sm:flex-row text-red-500">
              <a>
                {error}
              </a>
            </div>
        )
        }

        {dataTime && dataAmountPro && dataAmountVen ? (
            <div className="flex flex-col w-full 2xl:w-[540px] h-full bg-gray-300 rounded-2xl p-1 outline-2 outline-blue-900">
              <div className="flex gap-4 text-black mt-2 text-[20px] font-semibold items-center flex-col">
                <a>
                 Producción vs Ventas
                </a>
              </div>
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

              <div className="flex flex-col sm:flex-row items-start justify-center gap-2 mr-2">
                <div className="flex p-2 ml-1 text-black w-full  justify-between bg-[#99A1AF] border-gray-900 rounded-lg sm:w-[230px]">
                  <label className="ml-1 font-medium" htmlFor="fin">Desde</label>
                  <input className="ml-1 sm:w-[130px] md:w-full" id='fin' name='fin' value={fin} type='date'
                         onChange={(e) => setFin(e.target.value)}/>
                </div>
                <div className="flex p-2 ml-1 text-black mb-2 w-full bg-[#99A1AF] justify-between border-gray-900 rounded-lg sm:w-[230px]">
                  <label className="ml-1 font-medium" htmlFor="inicio">Hasta</label>
                  <input className="ml-1 sm:w-[130px] md:w-full" id='inicio' name='inicio' value={inicio} type='date' onChange={(e) => setInicio(e.target.value)}/></div>
              </div>
            </div>

        ) : !error && (
            <p>Cargando gráficas...</p>
        )}


          {data && data.length > 0 ? (
              <div className="flex flex-col 2xl:w-[540px] min-h-fit bg-gray-300 rounded-2xl p-1.5 outline-2 outline-blue-900">
                <div className="flex gap-4 text-black  mb-1 mt-1 text-[20px] font-semibold items-center flex-col">
                  <a>
                    Registro completo de movimientos
                  </a>
                </div>
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
                      item.cantidad.toString().includes(filterText) || item.hora.toString().trim().includes(filterText.toLowerCase().trim())
                  )}
                  //Might be a good idea to add a sort for the types (peso) of the bags
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
                    tableWrapper: {
                      style:{
                        overflowX: 'auto',
                      }
                    },
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
          ) : !error && (
              <p>Cargando tabla...</p>
          )}

        {stock && stockMax ? (
        <div className="2xl:w-[540px] bg-[#D1D5DC] h-[300px] flex flex-col justify-center items-center rounded-2xl p-1 outline-2 outline-blue-900">
          <div className="flex gap-4 text-black mt-2 text-[20px] font-semibold items-center flex-col">
            <a>
              Inventario en stock
            </a>
          </div>
          <Gauge
              className={'w-full'}
            value={stock}
            cy='63%'
            valueMax={stockMax}
            startAngle={-110}
            endAngle={110}
            innerRadius="70%"
            outerRadius="90%"
            text={({ value, valueMax }) => `${value} / ${valueMax}`}
            sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 20,
              fontWeight: 'semibold',
              transform: 'translate(0px, -20px)',
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: '#008B8B',
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: theme.palette.text.disabled,
            },
          })}
            cornerRadius='40%'
            width={300}
          />

        </div>
        ) : !error && (
            <p>Cargando tabla...</p>
        )}


        {stockComponents ? (
        <div className="w-full 2xl:w-[540px] bg-[#D1D5DC] h-[300px] rounded-2xl p-1 outline-2 outline-blue-900">
          <div className="flex gap-4 text-black mt-2 mb-2 text-[20px] font-semibold items-center flex-col">
            <a>
              Composición del inventario
            </a>
          </div>
          <PieChart
          colors={['#008B8B', '#ADD8E6']}
          series={[{
            data: [
              {id: 0, value: stockComponents?.peso_3kg, label:'Bolsas de 3kg'},
              {id: 1, value: stockComponents?.peso_6kg, label:'Bolsas de 6kg'},
            ],
            arcLabel: (item) => `${item.value}`,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 20, additionalRadius: -20, color: 'gray' },
            paddingAngle: 2,
            cornerRadius: 4,
            innerRadius: 5
          }]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fontWeight: 'bold',
              fontSize: '16px',
            },
          }}
          slotProps={{
            legend:{
              direction: 'horizontal',
              position: {
                vertical: 'bottom',
                horizontal: 'center'
              },
              sx: {
                fontSize: 15,
                fontWeight: 'bold',
              }
            }
          }}
          width={200}
          height={200}

          />
        </div>
        ) : !error && (
            <p>Cargando gráficas...</p>
        )}

      </main>
    </div>
  );
}
