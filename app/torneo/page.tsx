'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Jugador = {
  id: number
  nombre: string
  posicion: string
  temporada: string
  rating: number
}

type EquipoMitico = {
  id: number
  nombre: string
  equipo_id: number
  rating: number
}

type Equipo = {
  nombre: string
  rating: number
  pj: number
  g: number
  e: number
  p: number
  gf: number
  gc: number
  pts: number
}

type Partido = {
  local: string
  visita: string
  golesLocal: number
  golesVisita: number
}

// Genera un número de goles aleatorio con distribución de Poisson
function poisson(lambda: number): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= Math.random()
  } while (p > L)
  return k - 1
}

// Genera fixture round-robin doble (ida y vuelta) para n equipos
function generarFixture(nombres: string[]): { local: string; visita: string }[][] {
  const n = nombres.length
  const jornadas: { local: string; visita: string }[][] = []
  const equipos = [...nombres]

  // Si es impar, agregamos un "bye"
  if (n % 2 !== 0) equipos.push('BYE')

  const total = equipos.length
  const rondas = total - 1

  for (let r = 0; r < rondas; r++) {
    const jornada: { local: string; visita: string }[] = []
    for (let i = 0; i < total / 2; i++) {
      const a = equipos[i]
      const b = equipos[total - 1 - i]
      if (a !== 'BYE' && b !== 'BYE') {
        if (r % 2 === 0) {
          jornada.push({ local: a, visita: b })
        } else {
          jornada.push({ local: b, visita: a })
        }
      }
    }
    jornadas.push(jornada)
    // Rotar equipos (excepto el primero)
    equipos.splice(1, 0, equipos.pop()!)
  }

  // Vuelta: invertir local/visita
  const vuelta = jornadas.map((j) => j.map((p) => ({ local: p.visita, visita: p.local })))

  return [...jornadas, ...vuelta]
}

function simularPartido(ratingLocal: number, ratingVisita: number): { gl: number; gv: number } {
  const diff = ratingLocal - ratingVisita
  // Base de goles esperados + ajuste por diferencia de rating + ventaja de local
  const lambdaLocal = Math.max(0.3, 1.3 + diff * 0.04 + 0.15)
  const lambdaVisita = Math.max(0.3, 1.3 - diff * 0.04)
  return { gl: poisson(lambdaLocal), gv: poisson(lambdaVisita) }
}

export default function TorneoPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)
  const [tabla, setTabla] = useState<Equipo[]>([])
  const [fixture, setFixture] = useState<Partido[][]>([])
  const [nombreUsuario, setNombreUsuario] = useState('Tu Equipo')

  useEffect(() => {
    const ejecutar = async () => {
      const equipoTitularStr = localStorage.getItem('equipoTitular')
      const equipoIdStr = localStorage.getItem('equipoId')

      if (!equipoTitularStr || !equipoIdStr) {
        router.push('/seleccion')
        return
      }

      const equipoTitular: Jugador[] = JSON.parse(equipoTitularStr)
      const equipoId = parseInt(equipoIdStr)
      const ratingUsuario =
        equipoTitular.reduce((sum, j) => sum + j.rating, 0) / equipoTitular.length

      // Obtener nombre del equipo del usuario
      const { data: equipoData } = await supabase
        .from('equipos')
        .select('nombre')
        .eq('id', equipoId)
        .single()

      const nombreEquipoUsuario = equipoData?.nombre || 'Tu Equipo'
      setNombreUsuario(nombreEquipoUsuario)

      // Obtener equipos míticos rivales (excluyendo el equipo del usuario)
      const { data: miticos } = await supabase
        .from('equipos_miticos')
        .select('*')
        .neq('equipo_id', equipoId)

      if (!miticos || miticos.length < 15) {
        console.error('No hay suficientes equipos míticos cargados')
        setCargando(false)
        return
      }

      // Sortear 15 rivales
      const shuffled = [...miticos].sort(() => Math.random() - 0.5)
      const rivales = shuffled.slice(0, 15) as EquipoMitico[]

      // Armar tabla inicial
      const equiposTorneo: Record<string, Equipo> = {}
      equiposTorneo[nombreEquipoUsuario] = {
        nombre: nombreEquipoUsuario,
        rating: ratingUsuario,
        pj: 0,
        g: 0,
        e: 0,
        p: 0,
        gf: 0,
        gc: 0,
        pts: 0,
      }
      for (const rival of rivales) {
        equiposTorneo[rival.nombre] = {
          nombre: rival.nombre,
          rating: rival.rating,
          pj: 0,
          g: 0,
          e: 0,
          p: 0,
          gf: 0,
          gc: 0,
          pts: 0,
        }
      }

      // Generar fixture (30 fechas)
      const nombres = Object.keys(equiposTorneo)
      const jornadas = generarFixture(nombres)

      // Simular cada partido
      const fixtureSimulado: Partido[][] = []
      for (const jornada of jornadas) {
        const jornadaSimulada: Partido[] = []
        for (const { local, visita } of jornada) {
          const ratingLocal = equiposTorneo[local].rating
          const ratingVisita = equiposTorneo[visita].rating
          const { gl, gv } = simularPartido(ratingLocal, ratingVisita)

          // Actualizar tabla
          const eqLocal = equiposTorneo[local]
          const eqVisita = equiposTorneo[visita]
          eqLocal.pj++
          eqVisita.pj++
          eqLocal.gf += gl
          eqLocal.gc += gv
          eqVisita.gf += gv
          eqVisita.gc += gl

          if (gl > gv) {
            eqLocal.g++
            eqLocal.pts += 3
            eqVisita.p++
          } else if (gl < gv) {
            eqVisita.g++
            eqVisita.pts += 3
            eqLocal.p++
          } else {
            eqLocal.e++
            eqVisita.e++
            eqLocal.pts += 1
            eqVisita.pts += 1
          }

          jornadaSimulada.push({ local, visita, golesLocal: gl, golesVisita: gv })
        }
        fixtureSimulado.push(jornadaSimulada)
      }

      // Ordenar tabla por puntos, luego diferencia de gol
      const tablaOrdenada = Object.values(equiposTorneo).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        return b.gf - b.gc - (a.gf - a.gc)
      })

      setTabla(tablaOrdenada)
      setFixture(fixtureSimulado)
      setCargando(false)
    }

    ejecutar()
  }, [router])

  if (cargando) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">Simulando torneo...</div>
  }

  if (tabla.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <p>No hay suficientes equipos míticos en la base de datos (se necesitan al menos 15).</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Tabla del Torneo</h1>

      <table className="w-full text-left mb-10">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="py-2">#</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>G</th>
            <th>E</th>
            <th>P</th>
            <th>GF</th>
            <th>GC</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {tabla.map((eq, idx) => (
            <tr
              key={eq.nombre}
              className={`border-b border-gray-800 ${
                eq.nombre === nombreUsuario ? 'bg-green-900/40 font-bold' : ''
              }`}
            >
              <td className="py-2">{idx + 1}</td>
              <td>{eq.nombre}</td>
              <td>{eq.pj}</td>
              <td>{eq.g}</td>
              <td>{eq.e}</td>
              <td>{eq.p}</td>
              <td>{eq.gf}</td>
              <td>{eq.gc}</td>
              <td>{eq.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mb-4">Fixture y Resultados</h2>
      {fixture.map((jornada, idx) => (
        <div key={idx} className="mb-4">
          <p className="text-gray-400 font-semibold mb-1">Fecha {idx + 1}</p>
          {jornada.map((partido, i) => (
            <p key={i} className="text-sm">
              {partido.local} {partido.golesLocal} - {partido.golesVisita} {partido.visita}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}