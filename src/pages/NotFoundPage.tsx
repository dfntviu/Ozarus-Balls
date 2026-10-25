import { Link } from 'react-router';
import { PlaceholderPage } from './PlaceholderPage.tsx';

export function NotFoundPage() {
  return (
    <PlaceholderPage title="Esta esfera no existe" phase="404">
      La página que buscas no está en el radar del dragón. <Link to="/">Volver al inicio</Link>.
    </PlaceholderPage>
  );
}
