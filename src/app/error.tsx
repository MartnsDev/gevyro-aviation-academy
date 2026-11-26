'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="empty"><h1>Não foi possível abrir esta página</h1><p>Seus dados locais foram preservados. Tente novamente.</p><button className="btn btn-primary" onClick={reset}>Tentar novamente</button></main>}
