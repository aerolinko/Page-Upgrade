'use client'
import {useState, useEffect} from "react";
import {redirect} from "next/navigation";
import {
  ArrowDownOnSquareIcon, ArrowLeftIcon, ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";
import {Button} from "@/app/ui/button";
import Produccion from "@/app/ui/produccion";
import Venta from "@/app/ui/venta";

export default function Dashboard() {
  const [isProduccion, setIsProduccion] = useState(false);
  const [isVenta, setIsVenta] = useState(false);

  return (

      <div className="flex flex-col items-center justify-center min-h-full">

        {isProduccion && (
        <main className=" m-10 bg-gray-700 p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-[350px]  sm:max-w-sm min-w-xs transform transition-all duration-300 ">
          <Produccion/>
          <Button onClick={()=>{
            setIsProduccion(false)
          }} className="mt-4 w-fit bg-gray-800 hover:bg-gray-500">
            <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-50" />
            Regresar
          </Button>
      </main>
        )}


        {isVenta && (
            <main className=" m-10 bg-gray-700 p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-[350px]  sm:max-w-sm min-w-xs transform transition-all duration-300 ">
              <Venta/>
              <Button onClick={()=>{
                setIsVenta(false)
              }} className="mt-4 w-fit bg-gray-800 hover:bg-gray-500">
                <ArrowLeftIcon className="mr-2 h-5 w-5 text-gray-50" />
                Regresar
              </Button>
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
