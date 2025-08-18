'use client'
import Image from "next/image";
import {BarChart} from "@mui/x-charts";
import {useState, useEffect} from "react";
import {format} from "date-fns";
import {blue, red} from "@mui/material/colors";
import {inverse} from "next/dist/lib/picocolors";

export default function Dashboard() {
  interface Data {
    produccion: number;
    fecha_correcta: Date;
    venta: number;
  }
  const [error, setError] = useState<String>();
  const [loading, setLoading] = useState<Boolean>();
  const [data, setData] = useState<Data[]>()
  const [dataAmountVen, setDataAmountVen] = useState<number[]>();
  const [dataTime, setDataTime] = useState<Date[]>();
  const [dataAmountPro, setDataAmountPro] = useState<number[]>();


  async function fetchData() {
    const response = await fetch("/api/data", {
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


  return (
    <div className=" font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex row-start-2 items-center">

        {error && (
            <div className="flex gap-4 items-center flex-col sm:flex-row text-red-500">
              <a>
                {error}
              </a>
            </div>
        )
        }

        {dataTime && dataAmountPro ? (
            <div className="flex w-full  bg-gray-300 rounded-2xl p-1 outline-2 outline-amber-500">
              <BarChart
                  xAxis={[{
                    data: dataTime,
                    scaleType: 'band',
                    valueFormatter: (date) => format(date, 'MMM dd')
                  }]}
                  series={[{
                    data: dataAmountPro,
                    label: 'Produccion',
                    color: '#1565c0',
                  },
                    {
                      data: dataAmountVen,
                      label: 'Ventas',
                      color: '#d32f2f',
                    }]}
                  className="min-w-full max-w-[500px] min-h-[300px] max-h-[300px] lg:min-w-[600px]"
              />
            </div>
        ) : !error && (
            <p>Cargando gráficas...</p>
        )}

      </main>
    </div>
  );
}
