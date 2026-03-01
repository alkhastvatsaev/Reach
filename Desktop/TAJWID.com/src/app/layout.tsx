import './globals.css';

export const metadata = {
  title: 'TAJWID-VATSAEV',
  description: 'AI-powered Tajwid Web App',
  manifest: '/manifest.json',
  icons: {
    apple: '/assets/icons/icon-192x192.png',
  },
};

export const viewport = {
  themeColor: '#030303',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
