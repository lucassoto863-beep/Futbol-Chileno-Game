export default function Header({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <header className="mb-10">
      <p className="text-sm text-green-400 font-semibold tracking-widest uppercase mb-2">
        Liga de los Sueños · Fútbol Chileno
      </p>
      <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
        {titulo}
      </h1>
      {subtitulo && <p className="text-gray-400 mt-2 text-lg">{subtitulo}</p>}
    </header>
  )
}