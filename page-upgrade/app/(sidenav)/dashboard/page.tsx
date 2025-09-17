'use client'
import {
  areaElementClasses,
  BarChart, chartsAxisHighlightClasses,
  Gauge,
  gaugeClasses, lineElementClasses,
  pieArcLabelClasses,
  PieChart, SparkLineChart
} from "@mui/x-charts";
import React, {useState, useEffect} from "react";
import {format} from "date-fns";
import {es} from "date-fns/locale/es";
import DataTable from "react-data-table-component";
import {redirect} from "next/navigation";
import {Button} from "@/app/ui/button";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {esES} from "@mui/x-date-pickers/locales";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {
  LinearProgress,
  linearProgressClasses,
  ToggleButton,
  ToggleButtonGroup,
  toggleButtonGroupClasses
} from "@mui/material";
import {now} from "d3-timer";
import {ProgressBar} from "primereact/progressbar";

export default function Dashboard() {
  interface Data {
    produccion: number;
    fecha_correcta: Date;
    venta: number;
  }
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

  interface Distribuidor {
    cedula: number;
    venta: number;
    primer_nombre: string;
    primer_apellido: string;
    segundo_nombre: string;
    segundo_apellido: string;
  }

  interface Serie {
    data: number[];
    label:string
  }

  interface Meta {
    venta: number;
    meta: number;
  }

  const [error, setError] = useState<string>()
  const [data, setData] = useState<Movimiento[]>()
  const [dataMeta, setDataMeta] = useState<Meta>()
  const [isMetaReached, setIsMetaReached] = useState<boolean>(false)
  const [stock, setStock] = useState<number>(0)
  const [stockMax, setStockMax] = useState<number>(0)
  const [stockComponents, setStockComponents] = useState<StockComponent>()
  const [inicio, setInicio] = useState<Date>(new Date())
  const [fin, setFin] = useState<Date>(new Date(Date.now() - 7*60*60*24*1000))
  const [dataAmountVen, setDataAmountVen] = useState<number[]>()
  const [dataDist, setDataDist] = useState<Distribuidor[]>()
  const [serieDist, setSerieDist] = useState<Serie[]>()
  const [dataTime, setDataTime] = useState<Date[]>()
  const [dataAmountPro, setDataAmountPro] = useState<number[]>()
  const [filterText, setFilterText] = useState('')
  const [is3kgEnabled, setIs3kgEnabled] = useState<boolean>(true)
  const [is6kgEnabled, setIs6kgEnabled] = useState<boolean>(true)
  const [selection,setSelection] = useState<string>('ambos')
  const [showHighlight, setShowHighlight] = React.useState(true);
  const [showTooltip, setShowTooltip] = React.useState(true);
  const [monthPicker, setMonthPicker] = useState<Date>(new Date(Date.now()));
  const [selectionDist,setSelectionDist] = useState<string>('todos')
  const [selectionDistWeight,setSelectionDistWeight] = useState<string>('ambos')

  const handleHighlightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowHighlight(event.target.checked);
  };

  const handleTooltipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowTooltip(event.target.checked);
  };

 const columns = [
   {
     name: 'FECHA',
     selector: (row: Movimiento) => format(new Date(row.fecha_correcta), 'dd/MM/yyyy'),
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

  async function fetchData() {
    let response:Response;
    if( is6kgEnabled && is3kgEnabled ){
      response = await fetch(`/api/data?inicio=${format(inicio,'yyyy-MM-dd')}&fin=${format(fin,'yyyy-MM-dd')}&6kg=1&3kg=1`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
      });
    }else{
      if(is6kgEnabled && !is3kgEnabled ){
        response = await fetch(`/api/data?inicio=${format(inicio,'yyyy-MM-dd')}&fin=${format(fin,'yyyy-MM-dd')}}&6kg=1`, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
        });
      }
      else {
        response = await fetch(`/api/data?inicio=${format(inicio,'yyyy-MM-dd')}&fin=${format(fin,'yyyy-MM-dd')}&3kg=1`, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
        });
      }
    }
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

  async function fetchDataMeta() {
    const response = await fetch(`/api/meta?top=1`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
        if(res.data[0].venta){
            setDataMeta(res.data[0]);
        }else{
            setDataMeta({meta:res.data[0].meta,venta:0});
        }

    } else {
      forceExpiredLogOut(response);
      setError("Error obteniendo los datos del servidor");
    }

  }

  async function fetchDistData() {
    const response = await fetch(`/api/distribuidor?dist=1&mes=${format(monthPicker,'yyyy-MM-dd')}
    &modo=${selectionDist}&peso=${selectionDistWeight}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (response.ok) {
      const res = await response.json();
      setDataDist(res.data);
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

  async function fillDistSerie() {
    const list:Serie[]=[];
    dataDist?.forEach((p:Distribuidor) => {
        list.push({data:[p.venta],label:p.primer_nombre+' '+p.primer_apellido})
    });
    setSerieDist(list);
  }

    const handleSelectDist = (
        event: React.MouseEvent<HTMLElement>,
        newSelection: string | null,
    ) => {
        if (newSelection !== null) {
            setSelectionDist(newSelection);
        }
    };

    const handleSelectDistWeight = (
        event: React.MouseEvent<HTMLElement>,
        newSelection: string | null,
    ) => {
        if (newSelection !== null) {
            setSelectionDistWeight(newSelection);
        }
    };

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
    fetchDistData();
    fetchDataMeta();
  }, []);

  useEffect(() => {
    fetchData();
  }, [inicio,fin,is3kgEnabled,is6kgEnabled]);

  useEffect(() => {
    fillDistSerie();
  }, [dataDist]);

    useEffect(() => {
        fetchDistData();
    }, [monthPicker,selectionDist,selectionDistWeight]);

  useEffect(() => {
    if(dataMeta && dataMeta.venta>=dataMeta.meta){
      setIsMetaReached(true);
    }
  }, [dataMeta]);

  useEffect(() => {
    if(selection=='3kg'){setIs3kgEnabled(true); setIs6kgEnabled(false)}
    else if(selection=='6kg'){setIs6kgEnabled(true); setIs3kgEnabled(false)}
    else {setIs3kgEnabled(true); setIs6kgEnabled(true)}
  }, [selection]);

  return (
    <div className=" font-sans items-center justify-items-center min-h-full pb-20 gap-16 sm:p-2 ">
      <main className="mt-15 sm:mt-10 grid xl:grid-cols-2 grid-rows-1 grid-cols-1 items-center gap-10 rounded-xl">

        {error && (
            <div className="flex gap-4 items-center flex-col sm:flex-row text-red-500">
              <a>
                {error}
              </a>
            </div>
        )
        }

        {dataTime && dataAmountPro && dataAmountVen ? (
            <div className="relative flex flex-col w-full 2xl:w-[540px] h-full bg-gray-300 rounded-xl p-1 outline-1 shadow-md">
              <div className="flex gap-4 text-black mt-2 text-[20px] font-semibold items-center flex-col">
                <a>
                 Producción vs Ventas
                </a>
              </div>
              {/*
              <div className='z-1 right-2 top-2 absolute'>
              <ToggleButtonGroup
                  color="primary"
                  sx={{justifyContent: "end",[`& .${toggleButtonGroupClasses.selected}`]:{
                      borderColor: "deepskyblue",
                      color:'black',
                      fontSize:{xs: "10px", lg:"14px"},
                      borderWidth:"2px",
                    },[`& .${toggleButtonGroupClasses.grouped}`]:{
                    color:'black',
                      fontSize:{xs: "10px", lg:"14px"},
                      borderWidth:"2px",
                  }}}
                  exclusive
                  aria-label="Platform"
                  orientation={'vertical'}
                  value={selection}
                  onChange={(e,newSelection:string) => {setSelection(newSelection)}}
              >
                <ToggleButton value="ambos">Ambos</ToggleButton>
                <ToggleButton value="6kg">6kg</ToggleButton>
                <ToggleButton value="3kg">3kg</ToggleButton>
              </ToggleButtonGroup>
              </div>
              */}
              <Button onClick={()=>{
                is6kgEnabled && is3kgEnabled ?
                    setIs6kgEnabled(false) : setIs6kgEnabled(true)
              }}
                      className={`w-[50px] justify-center  absolute right-2 top-2 ${is6kgEnabled ? 'outline-2' : 'bg-gray-500'} `}>
                6Kg
              </Button>
              <Button onClick={()=>{
                is3kgEnabled && is6kgEnabled ?
                    setIs3kgEnabled(false) : setIs3kgEnabled(true)
              }}
                      className={`w-[50px] z-1  justify-center absolute sm:right-17 sm:top-2 right-2 top-13 ${is3kgEnabled ? 'outline-2' : 'bg-gray-500'} `}>
                3Kg
              </Button>
              <BarChart
                  yAxis={[{
                      valueFormatter:(number:number) => number>=1000 ? `${Math.floor(number)/1000}K` : `${number}`,
                  }]}
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

              {/*
              <div className="flex flex-col sm:flex-row items-start justify-center gap-2 mr-2">
                <div className="flex p-2 ml-1 text-black w-full  justify-between bg-[#99A1AF] border-gray-900 rounded-lg sm:w-[230px]">
                  <label className="ml-1 font-medium" htmlFor="fin">Desde</label>
                  <input className="ml-1 sm:w-[130px] md:w-full" id='fin' name='fin' value={fin} type='date'
                         onChange={(e) => setFin(e.target.value)}/>
                </div>
                <div className="flex p-2 ml-1 text-black mb-2 w-full bg-[#99A1AF] justify-between border-gray-900 rounded-lg sm:w-[230px]">
                  <label className="ml-1 font-medium" htmlFor="inicio">Hasta</label>
                  <input className="ml-1 sm:w-[130px] md:w-full" id='inicio' name='inicio' value={inicio} type='date' onChange={(e) => setInicio(e.target.value)}/>
                </div>
              </div>
              */}

              <div className="flex px-3 flex-row items-start justify-center gap-2 mb-5">
                <LocalizationProvider adapterLocale={es} localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText} dateAdapter={AdapterDateFns}>
                  <DatePicker label={'Desde'}  slotProps={{actionBar: {actions: ['today','accept']}}} value={fin} onChange={(newValue) => newValue && setFin(newValue)}/>
                  <DatePicker label={'Hasta'}  slotProps={{actionBar: {actions: ['today','accept']}}} value={inicio} format={'dd/MM/yyyy'}  onChange={(newValue) => newValue && setInicio(newValue)}/>
                </LocalizationProvider>
              </div>
            </div>

        ) : !error && (
            <p>Cargando gráficas...</p>
        )}


          {data && data.length > 0 ? (
              <div className="flex flex-col px-4 2xl:w-[540px] min-h-fit bg-gray-300 rounded-xl py-3 outline-1 shadow-md">
                <div className="flex gap-4 text-black  mb-1 mt-1 text-[20px] font-semibold items-center flex-col">
                  <a>
                     Historial de movimientos
                  </a>
                </div>
                <div className='relative px-1 mb-3'>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="p-2 pl-12 border w-full shadow-md placeholder:text-gray-900 border-gray-300 bg-gray-400 text-black rounded-lg"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2  -translate-y-1/2 h-6 w-6 text-black" />
                </div>

              <DataTable
                  columns={columns}
                  data={data.filter(item =>
                      format(item.fecha_correcta, 'dd/MM/yyyy').includes(filterText.toLowerCase().trim()) ||
                      item.tipodemovimiento.toLowerCase().includes(filterText.toLowerCase().trim()) ||
                      item.cantidad.toString().includes(filterText) || item.hora.toString().trim().includes(filterText.toLowerCase().trim())
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
                        minWidth: '542px',
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
                        marginTop: '2px',
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
          ) : !error && (
              <p>Cargando tabla...</p>
          )}

        {stock && stockMax ? (
        <div className="2xl:w-[540px] bg-[#D1D5DC] h-[300px] flex flex-col justify-center items-center rounded-xl p-1 outline-1 shadow-md">
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
        <div className="w-full 2xl:w-[540px] bg-[#D1D5DC] h-[300px] rounded-xl p-1 outline-1 shadow-md">
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

        {dataDist && serieDist ? (
            <div className="relative flex flex-col w-full 2xl:w-[540px] h-full bg-gray-300 rounded-xl p-1 outline-1 shadow-md">
              <div className="flex gap-4 text-black mt-2 text-[20px] font-semibold items-center flex-col">
                <a>
                  Ventas por Distribuidor Particular
                </a>
              </div>
              <BarChart
                  yAxis={[{
                    data: [monthPicker],
                    scaleType: 'band',
                    valueFormatter: (date) => format(date, 'MMM',{ locale: es })
                        .replace(/(\b\w)/g, (match) => match.toUpperCase())
                  }]}
                  xAxis={[{
                      valueFormatter:(number:number) => number>=1000 ? `${Math.floor(number)/1000}K` : `${number}`,
                  }]}
                  slotProps={{
                    legend: {
                      sx: {
                        justifyContent: 'space-evenly',
                      },
                    },
                  }}
                  layout="horizontal"
                  series={serieDist}
                  className=" min-w-full min-h-[300px] max-h-[300px]"/>
              <div className="flex px-3 flex-row items-center justify-evenly gap-2 mb-2">
                <LocalizationProvider adapterLocale={es} localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText} dateAdapter={AdapterDateFns}>
                    <DatePicker label={'Mes'} value={monthPicker} views={['month','year']} onChange={(e) => {e && setMonthPicker(e)}} />
                </LocalizationProvider>
                  <ToggleButtonGroup
                      color="primary"
                      sx={{[`& .${toggleButtonGroupClasses.selected}`]:{
                              borderColor: "deepskyblue",
                              color:'black',
                              fontSize:{xs: "10px", lg:"12px"},
                              borderWidth:"2px",
                          },[`& .${toggleButtonGroupClasses.grouped}`]:{
                              color:'black',
                              fontSize:{xs: "10px", lg:"12px"},
                              borderWidth:"2px",
                          }}}
                      exclusive
                      aria-label="Platform"
                      value={selectionDist}
                      onChange={handleSelectDist}
                  >
                      <ToggleButton value="todos">Todos</ToggleButton>
                      <ToggleButton value="particulares">Particulares</ToggleButton>
                  </ToggleButtonGroup>
              </div>
                <ToggleButtonGroup
                    color="primary"
                    sx={{[`& .${toggleButtonGroupClasses.selected}`]:{
                            borderColor: "deepskyblue",
                            color:'black',
                            fontSize:{xs: "10px", lg:"12px"},
                            borderWidth:"2px",
                        },[`& .${toggleButtonGroupClasses.grouped}`]:{
                            color:'black',
                            fontSize:{xs: "10px", lg:"12px"},
                            borderWidth:"2px",
                        },
                        justifyContent:'center',
                    marginBottom:'10px'}}
                    exclusive
                    aria-label="Platform"
                    value={selectionDistWeight}
                    onChange={handleSelectDistWeight}
                >
                    <ToggleButton value="ambos">Ambos</ToggleButton>
                    <ToggleButton value="3kg">3kg</ToggleButton>
                    <ToggleButton value="6kg">6kg</ToggleButton>
                </ToggleButtonGroup>
            </div>

        ) : !error && (
            <p>Cargando gráficas...</p>
        )}

        {/*dataDist && serieDist ? (
            <div className="relative flex flex-col w-full 2xl:w-[540px] h-full bg-gray-300 rounded-xl p-1 outline-1 shadow-md">
              <div className="flex gap-4 text-black mt-2 text-[20px] font-semibold items-center flex-col">
                <a>
                  Tendencia de bolsas no cobradas
                </a>
              </div>


              {/*
              <div className='z-1 right-2 top-2 absolute'>
              <ToggleButtonGroup
                  color="primary"
                  sx={{justifyContent: "end",[`& .${toggleButtonGroupClasses.selected}`]:{
                      borderColor: "deepskyblue",
                      color:'black',
                      fontSize:{xs: "10px", lg:"14px"},
                      borderWidth:"2px",
                    },[`& .${toggleButtonGroupClasses.grouped}`]:{
                    color:'black',
                      fontSize:{xs: "10px", lg:"14px"},
                      borderWidth:"2px",
                  }}}
                  exclusive
                  aria-label="Platform"
                  orientation={'vertical'}
                  value={selection}
                  onChange={(e,newSelection:string) => {setSelection(newSelection)}}
              >
                <ToggleButton value="ambos">Ambos</ToggleButton>
                <ToggleButton value="6kg">6kg</ToggleButton>
                <ToggleButton value="3kg">3kg</ToggleButton>
              </ToggleButtonGroup>
              </div>
               }


              <SparkLineChart
                  showHighlight={showHighlight}
                  showTooltip={showTooltip}
                  data={[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,18]}
                  plotType={'line'}
                  area={true}
                  sx={{
                [`& .${areaElementClasses.root}`]: {opacity: 0.2},
                [`& .${lineElementClasses.root}`]: {strokeWidth: 3},
                [`& .${chartsAxisHighlightClasses.root}`]: {
                  stroke: 'rgb(137, 86, 255)',
                  strokeDasharray: 'none',
                  strokeWidth: 2,
                  }}}
                    className=" min-w-full min-h-[300px] max-h-[300px]"/>
              <div className="flex px-3 flex-row items-start justify-center gap-2 mb-5">
                <LocalizationProvider adapterLocale={es} localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText} dateAdapter={AdapterDateFns}>

                </LocalizationProvider>
              </div>
            </div>

        ) : !error && (
            <p>Cargando gráficas...</p>
        )
        */}

        {dataMeta ? (
            <div className="flex justify-center flex-col w-full 2xl:w-[540px] h-full bg-gray-300 rounded-xl p-1 outline-1 shadow-md">
              <div className="flex gap-4 text-black mt-2 text-[20px] font-semibold items-center flex-col">
                <a>
                  Meta de ventas mensual
                </a>
              </div>
                <BarChart
                    xAxis={[{
                        data: [new Date()],
                        scaleType: 'band',
                        valueFormatter: (date) => format(date, 'MMM',{ locale: es })
                            .replace(/(\b\w)/g, (match) => match.toUpperCase())
                    }]}
                    yAxis={[{
                        valueFormatter:(number:number) => number>=1000 ? `${Math.floor(number)/1000}K` : `${number}`,
                    }]}
                    slotProps={{
                        legend: {
                            sx: {
                                justifyContent: 'space-evenly',
                            },
                        },
                    }}
                    series={[{
                        data: [dataMeta.meta],
                        label: 'Meta',
                        color:'#A230FF'
                    },
                        {
                            data: [dataMeta.venta],
                            label: 'Ventas',
                            color: '#d32f2f',
                        }]}
                    className=" min-w-full min-h-[300px] "/>
              <div className="flex px-3 flex-row items-start justify-center gap-2 mb-5">
                <LocalizationProvider adapterLocale={es} localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText} dateAdapter={AdapterDateFns}>

                </LocalizationProvider>
              </div>
            </div>

        ) : !error && (
            <p>Cargando gráficas...</p>
        )}


      </main>
    </div>
  );
}
