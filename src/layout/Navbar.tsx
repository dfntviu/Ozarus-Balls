import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { publishedSagas } from '../data/sagas.ts';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';
import styles from './Navbar.module.css';

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  ...publishedSagas.map((s) => ({ to: `/sagas/${s.id}`, label: s.short, end: false })),
  { to: '/villanos', label: 'Villanos', end: false },
  { to: '/juegos', label: 'Juegos', end: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  // useRef: referencias al DOM que no deben provocar renders (foco y detección de clic fuera).
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar al cambiar de ruta (incluye "atrás" del navegador). Patrón de React para
  // ajustar estado cuando cambia un valor: comparar durante el render, sin useEffect.
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Con el menú abierto: Escape cierra y devuelve el foco al botón; clic fuera cierra.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link to="/" className={styles.brand} aria-label="Ozarus & Balls, inicio">
          <span className={styles.ball} aria-hidden="true">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </span>
          <span className={styles.brandText}>
            Ozarus <span className={styles.amp}>&amp;</span> Balls
          </span>
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.burger} data-open={open} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="visually-hidden">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>

        <div ref={panelRef} id={panelId} className={styles.panel} data-open={open}>
          <nav aria-label="Principal">
            <ul className={styles.links}>
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
