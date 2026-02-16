
import type { Metadata } from 'next';
import './globals.css';
import TabBar from './components/TabBar';

export const metadata: Metadata = {
  title: 'CourseConnect',
  description: 'Application de shopping entre voisins',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
