import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Gevyro Aviation Academy',description:'Seu centro de estudos de manutenção aeronáutica.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Gevyro Academy'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#102b4e'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR" suppressHydrationWarning><body>{children}</body></html>}
