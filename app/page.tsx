'use client'

import { useRouter } from 'next/navigation'
import Header from '@/app/components/header'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 md:px-16 flex flex-col justify-between">
      <div>
        <Header
          titulo="Liga de los Sueños"
          subtitulo="Arma el 11 histórico de tu equipo favorito y juega una temporada completa"
        />

        <div className="space-y-4 mb-12 max-w-2xl">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <p className="text-green-400 font-semibold mb-2">01</p>
            <h3 className="text-2xl font-bold mb-2">Elige tu equipo</h3>
            <p className="text-gray-400">Selecciona uno de los 32 clubes históricos del fútbol chileno</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <p className="text-green-400 font-semibold mb-2">02</p>
            <h3 className="text-2xl font-bold mb-2">Arma tu 11</h3>
            <p className="text-gray-400">Selecciona una formación y elige jugadores de distintas épocas de tu club</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <p className="text-green-400 font-semibold mb-2">03</p>
            <h3 className="text-2xl font-bold mb-2">Juega el torneo</h3>
            <p className="text-gray-400">Simula una temporada completa contra equipos míticos de la liga chilena</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/seleccion')}
          className="bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-8 rounded-2xl text-lg transition-all w-full md:w-auto"
        >
          Jugar ahora →
        </button>
      </div>

      <footer className="text-gray-500 text-sm mt-16 pt-8 border-t border-[#2a2a2a]">
        <p>Liga de los Sueños · Fútbol Chileno · ¿No estás de acuerdo con alguna valoración?</p>
      </footer>
    </div>
  )
}