const HOME_SPLASH_LOGO_URL =
  'https://res.cloudinary.com/dfyp1q7tl/image/upload/v1776210381/quehayhoy-logo_pecet6.png'

/**
 * Splash breve de arranque para móvil en la primera carga del inicio.
 */
export function HomeStartupSplash() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white px-6">
      <img
        src={HOME_SPLASH_LOGO_URL}
        alt="QUEHAYHOY"
        className="w-full max-w-[320px] select-none"
        draggable="false"
      />
    </div>
  )
}

export default HomeStartupSplash
