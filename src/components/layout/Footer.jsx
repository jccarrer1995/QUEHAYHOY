import { LEGAL_LINKS } from '../../lib/legalLinks.js'

function withBase(path) {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  return `${normalizedBase}${path}`
}

export function Footer() {
  const footerItems = [
    {
      title: '¿Qué es QUEHAYH🔥Y?',
      description:
        'Tu guía definitiva para descubrir eventos, conciertos y planes únicos en Guayaquil. No te pierdas nada de lo que pasa en la ciudad.',
    },
    {
      title: 'Sé parte del mapa',
      description:
        '¿Organizas un evento o tienes un local? Únete a nuestra plataforma y llega a miles de guayacos buscando su próximo plan.',
    },
    {
      title: 'Contacto y Soporte',
      description:
        '¿Tienes dudas o sugerencias? Escríbenos y ayúdanos a mejorar la cultura urbana de nuestra ciudad.',
    },
  ]

  return (
    <footer className="mt-auto hidden overflow-x-hidden bg-[#1f1f1f] px-5 pt-10 pb-8 text-white lg:block">
      <div className="mx-auto max-w-6xl min-w-0">
        <div className="grid gap-8 lg:grid-cols-3">
          {footerItems.map((item) => (
            <div key={item.title} className="block min-w-0">
              <p className="text-lg font-semibold tracking-tight text-gray-100 xl:text-xl">
                {item.title}
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <hr className="mt-[30px] border-0 border-t border-gray-800" />

        <div className="mt-6 grid items-center gap-5 lg:grid-cols-3">
          <div className="flex min-w-0 items-center justify-center gap-0.5 text-left text-3xl font-black tracking-tight lg:justify-self-start xl:text-4xl">
            <span className="text-white">QUEHAY</span>
            <span className="text-[#14b8a6]">H</span>
            <span className="text-2xl" aria-hidden>
              🔥
            </span>
            <span className="text-[#14b8a6]">Y</span>
          </div>

          <p className="text-center text-xs text-gray-500 lg:justify-self-center">
            © Todos los derechos reservados QUEHAYHOY - 2026
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-self-end lg:justify-end">
            {LEGAL_LINKS.map((item) => (
              <a
                key={item.type}
                href={withBase(item.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-normal text-gray-400 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
