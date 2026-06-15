'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

type Jugador = {
  id: number
  nombre: string
  posicion: string
  temporada: string
  rating: number
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function DraftPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const equipoId = searchParams.get('equipo')
  const formacionId = searchParams.get('formacion')

  const [posiciones, setPosiciones] = useState<string[]>([])
  const [jugadoresPorPosicion, setJugadoresPorPosicion] = useState<Record<string, Jugador[]>>({})
  const [pasoActual, setPasoActual] = useState(0)
  const [opciones, setOpciones] = useState<Jugador[]>([])
  const [equipoTitular, setEquipoTitular] = useState<Jugador[]>([])
  const [idsUsados, setIdsUsados] = useState<number[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Cargar formación
      const { data: formacionData } = await supabase
        .from('formaciones')
        .select('posiciones')
        .eq('id', formacionId)
        .single()

      // Cargar jugadores del equipo
      const { data: jugadoresData } = await supabase
        .from('jugadores')
        .select('*')
        .eq('equipo_id', equipoId)

      if (formacionData && jugadoresData) {
        const posicionesArr: string[] = formacionData.posiciones
        setPosiciones(posicionesArr)

        // Agrupar jugadores por posición
        const agrupados: Record<string, Jugador[]> = {}
        for (const pos of ['POR', 'DEF', 'MED', 'DEL']) {
          agrupados[pos] = jugadoresData.filter((j) => j.posicion === pos)
        }
        setJugadoresPorPosicion(agrupados)
      }
      setCargando(false)
    }
    fetchData()
  }, [equipoId, formacionId])

  // Cuando cambian datos o el paso, generar las 3 opciones
  useEffect(() => {
    if (posiciones.length === 0) return
    if (pasoActual >= posiciones.length) return

    const posicionActual = posiciones[pasoActual]
    const disponibles = (jugadoresPorPosicion[posicionActual] || []).filter(
      (j) => !idsUsados.includes(j.id)
    )
    const tresOpciones = shuffle(disponibles).slice(0, 3)
    setOpciones(tresOpciones)
  }, [pasoActual, posiciones, jugadoresPorPosicion, idsUsados])

  const elegirJugador = (jugador: Jugador) => {
    const nuevoEquipo = [...equipoTitular, jugador]
    const nuevosIdsUsados = [...idsUsados, jugador.id]

    if (pasoActual + 1 >= posiciones.length) {
      // Draft completo
      localStorage.setItem('equipoTitular', JSON.stringify(nuevoEquipo))
      localStorage.setItem('equipoId', equipoId || '')
      router.push('/simulacion')
    } else {
      setEquipoTitular(nuevoEquipo)
      setIdsUsados(nuevosIdsUsados)
      setPasoActual(pasoActual + 1)
    }
  }

  if (cargando) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">Cargando...</div>
  }

  if (posiciones.length === 0) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">No se encontró la formación.</div>
  }

  const posicionActual = posiciones[pasoActual]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">
        Posición {pasoActual + 1} de {posiciones.length}: {posicionActual}
      </h1>
      <p className="text-gray-400 mb-6">Elige uno de estos jugadores</p>

      {opciones.length === 0 ? (
        <p className="text-red-400">
          No hay suficientes jugadores en la base de datos para esta posición ({posicionActual}).
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opciones.map((jugador) => (
            <button
              key={jugador.id}
              onClick={() => elegirJugador(jugador)}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-left transition"
            >
              <p className="text-xl font-bold">{jugador.nombre}</p>
              <p className="text-gray-400">{jugador.temporada}</p>
              <p className="text-green-400 font-semibold mt-2">Rating: {jugador.rating}</p>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        <p className="text-sm text-gray-500">
          11 armado hasta ahora: {equipoTitular.map((j) => j.nombre).join(', ')}
        </p>
      </div>
    </div>
  )
}