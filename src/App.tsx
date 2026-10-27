import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { ThemeProvider } from './theme/ThemeProvider.tsx';
import { Layout } from './layout/Layout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { PlaceholderPage } from './pages/PlaceholderPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
  // import { SaaPagePhaseFour } from './pages/SagaPageTwo.tsx';
  // import { VillainsPage } from './pages/VillainsPage.tsx';
  // import { SagaPage } from './pages/SagaPage.tsx';

  
  const SagaPagePhaseFour = lazy(() => import('./pages/SagaPageTwo.tsx').then((m) => ({ default: m.SagaPagePhaseFour })));
  const VillainsPage = lazy(() =>  import('./pages/VillainsPage.tsx').then((m)=>({default: m.VillainsPage})) );

// App solo compone: proveedor de tema + rutas. Los datos los importa cada página.
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'sagas/:sagaId', element: <SagaPagePhaseFour /> },
      { path: 'villanos', element: <VillainsPage /> },
      { path: 'juegos', element: <PlaceholderPage title="Juegos" phase="F5 · F6">Trivia por niveles y sopa de letras con progreso guardado.</PlaceholderPage> },
      { path: '*', element: <NotFoundPage /> },
      // { path: 'villanos', element: <PlaceholderPage title="Villanos" phase="F4">Catálogo de villanos con filtro por saga en la URL.</PlaceholderPage> },
       // { path: 'sagas/:sagaId', element: <SagaPage /> },
    ]
  },
]);

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
