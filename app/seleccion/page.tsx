'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/header'

type Equipo = {
  id: number
  nombre: string
}

export default function SeleccionPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchEquipos = async () => {
      const { data, error } = await supabase.from('equipos').select('id, nombre')
      if (error) {
        console.error(error)
        return
      }
      setEquipos(data || [])
    }
    fetchEquipos()
  }, [])

  const elegirEquipo = (id: number) => {
    router.push(`/formacion?equipo=${id}`)
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:px-16">
      <Header
        titulo="Elige tu equipo"
        subtitulo="Selecciona el club con el que vas a armar tu 11 histórico"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {equipos.map((equipo) => (
          <button
            key={equipo.id}
            onClick={() => elegirEquipo(equipo.id)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-green-500 hover:bg-[#222] rounded-2xl p-5 text-center font-semibold transition-all"
          >
            {equipo.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}