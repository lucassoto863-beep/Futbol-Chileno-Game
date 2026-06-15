'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Jugador = {
  id: number
  nombre: string
  posicion: string
  temporada: string
  rating: number
}

export default function SimulacionPage() {
  const router = useRouter()
  const [equipoTitular, setEquipoTitular] = useState<Jugador[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem('equipoTitular')
    if (data) {
      setEquipoTitular(JSON.parse(data))
    }
    setCargando(false)
  }, [])

  if (cargando) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">Cargando...</div>
  }

  if (equipoTitular.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <p>No se encontró ningún equipo armado.</p>
        <button
          onClick={() => router.push('/seleccion')}
          className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
        >
          Volver a empezar
        </button>
      </div>
    )
  }

  const ratingPromedio =
    equipoTitular.reduce((sum, j) => sum + j.rating, 0) / equipoTitular.length

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Tu equipo titular</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {equipoTitular.map((jugador, idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">{jugador.posicion}</p>
            <p className="text-lg font-bold">{jugador.nombre}</p>
            <p className="text-gray-400 text-sm">{jugador.temporada}</p>
            <p className="text-green-400 font-semibold">Rating: {jugador.rating}</p>
          </div>
        ))}
      </div>

      <p className="text-xl mb-6">
        Rating promedio del equipo:{' '}
        <span className="font-bold text-green-400">{ratingPromedio.toFixed(1)}</span>
      </p>

      <button
  onClick={() => router.push('/torneo')}
  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-lg font-semibold"
>
  Sortear rivales y comenzar torneo
</button>
    </div>
  )
}