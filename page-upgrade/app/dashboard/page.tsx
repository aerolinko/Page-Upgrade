'use client'
import {BarChart} from "@mui/x-charts";
import {useState, useEffect} from "react";
import {format} from "date-fns";
import {es} from "date-fns/locale/es";


export default function Dashboard() {
  interface Data {
    produccion: number;
    fecha_correcta: Date;
    venta: number;
  }
  const [error, setError] = useState<String>();
  const [loading, setLoading] = useState<Boolean>();
  const [data, setData] = useState<Data[]>()
  const [inicio, setInicio] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [fin, setFin] = useState<string>(format(Date.now() - 7*60*60*24*1000,'yyyy-MM-dd'))
  const [dataAmountVen, setDataAmountVen] = useState<number[]>();
  const [dataTime, setDataTime] = useState<Date[]>();
  const [dataAmountPro, setDataAmountPro] = useState<number[]>();


  async function fetchData() {
    const response = await fetch(`/api/data?inicio=${inicio}&fin=${fin}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setData(res.data);
      setDataAmountVen(res.data.map((p: Data) => p.produccion));
      setDataTime(res.data.map((p: Data) => p.fecha_correcta));
      setDataAmountPro(res.data.map( (p:Data) =>p.venta));
    } else {
      setError("Error obteniendo los datos del servidor");
    }

  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [inicio,fin]);


  return (
    <div className=" font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-full p-2 pb-20 gap-16 sm:p-2 ">
      <main className="flex row-start-2 items-center gap-16 flex-col sm:flex-row bg-gradient-to-bl p-6 rounded-2xl">

        {error && (
            <div className="flex gap-4 items-center flex-col sm:flex-row text-red-500">
              <a>
                {error}
              </a>
            </div>
        )
        }

        {dataTime && dataAmountPro && dataAmountVen ? (
            <div className="flex flex-col w-full bg-gray-300 rounded-2xl p-1 outline-2 outline-blue-900">
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
                  className=" min-w-[290px] min-h-[300px] max-h-[300px] lg:min-w-[600px]"/>

              <div className="flex flex-col sm:flex-row items-start gap-2">
              <div className="flex p-2 ml-1 text-white border justify-between bg-gray-700 border-gray-900 rounded-lg w-[230px]">
                <label className="ml-1 font-medium" htmlFor="inicio">Inicio</label>
                <input className="ml-1" id='inicio' name='inicio' value={inicio} type='date'
                       onChange={(e) => setInicio(e.target.value)}/>
              </div>
              <div className="flex p-2 ml-1 mb-2 border bg-gray-700 justify-between border-gray-900 rounded-lg w-[230px]">
                <label className="ml-1 font-medium" htmlFor="fin">Fin</label>
                <input className="ml-1" id='fin' name='fin' value={fin} type='date' onChange={(e) => setFin(e.target.value)}/></div>
              </div>
            </div>

        ) : !error && (
            <p>Cargando gráficas...</p>
        )}
        <div className="flex flex-col w-full bg-gray-300 rounded-2xl p-1 outline-2 outline-blue-900">


          <div className="flex flex-col sm:flex-row items-start gap-2">
            <div className="flex p-2 ml-1 text-white border justify-between bg-gray-700 border-gray-900 rounded-lg w-[230px]">
              <label className="ml-1 font-medium" htmlFor="inicio">Inicio</label>
              <input className="ml-1" id='inicio' name='inicio' value={inicio} type='date'
                     onChange={(e) => setInicio(e.target.value)}/>
            </div>
            <div className="flex p-2 ml-1 mb-2 border bg-gray-700 justify-between border-gray-900 rounded-lg w-[230px]">
              <label className="ml-1 font-medium" htmlFor="fin">Fin</label>
              <input className="ml-1" id='fin' name='fin' value={fin} type='date' onChange={(e) => setFin(e.target.value)}/></div>
          </div>
        </div>

      </main>
    </div>
  );
}
