import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './Navbar.tsx';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.shell}>
      <a href="#contenido" className={styles.skip}>Saltar al contenido</a>
      <Navbar />
      <main id="contenido" className={styles.main} tabIndex={-1}>
         <Suspense fallback={ <p className={styles.loading} role="status" >Reuniendo las esferas..</p>}>
        <Outlet />
        </Suspense>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerBrand}>Ozarus &amp; Balls</p>
          <p>
            Desarrollado por Christopher ·{' '}
            <a href="https://github.com/dfntviu" target="_blank" rel="noreferrer">github.com/dfntviu</a>
          </p>
          <p className={styles.disclaimer}>
            Proyecto fan sin fines de lucro, sin afiliación con Toei Animation, Bird Studio ni Shueisha.
            Dragon Ball y sus personajes pertenecen a sus respectivos dueños.
          </p>
        </div>
      </footer>
    </div>
  );
}
