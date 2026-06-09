import { Navbar } from './Navbar.jsx'

/**
 * Barra superior global visible solo en desktop (hamburguesa, búsqueda, campana, tema).
 *
 * @param {{ searchValue?: string, onSearchChange?: (v: string) => void }} props
 */
export function DesktopNavbar({ searchValue = '', onSearchChange }) {
  return (
    <div className="relative z-50 hidden shrink-0 md:block">
      <Navbar searchValue={searchValue} onSearchChange={onSearchChange} />
    </div>
  )
}

export default DesktopNavbar
