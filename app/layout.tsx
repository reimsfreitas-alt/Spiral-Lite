import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Spiral Lite OS', description: 'Governed opportunity recovery execution layer.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
