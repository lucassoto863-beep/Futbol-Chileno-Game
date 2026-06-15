'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

type Formacion = {
  id: number
  nombre: string
  posiciones: string[]
}

export default function FormacionPage() {
  const [formaciones, setFormaciones] = useState<Formacion[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const equipoId = searchParams.get('equipo')

  useEffect(() => {
    const fetchFormaciones = async () => {
      const { data, error } = await supabase.from('formaciones').select('*')
      if (error) {
        console.error(error)
        return
      }
      setFormaciones(data || [])
    }
    fetchFormaciones()
  }, [])

  const elegirFormacion = (formacionId: number) => {
    router.push(`/draft?equipo=${equipoId}&formacion=${formacionId}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Elige tu formación</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {formaciones.map((formacion) => (
          <button
            key={formacion.id}
            onClick={() => elegirFormacion(formacion.id)}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 text-center text-xl font-semibold transition"
          >
            {formacion.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}