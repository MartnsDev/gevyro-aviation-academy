'use client';
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {supabase} from './client';

export function GoogleLogin({error}:{error:string}){
 const[busy,setBusy]=useState(false);
 const[localError,setLocalError]=useState('');
 const params=useSearchParams();
 const callbackError=params.get('auth_error')==='google';
 async function signIn(){
  setBusy(true);
  try{
   if(!supabase)throw new Error('Não foi possível conectar ao serviço de autenticação.');
   window.location.assign(new URL('/auth/google',window.location.origin).href);
  }catch(reason){setBusy(false);setLocalError(reason instanceof Error?reason.message:'Falha ao iniciar login com Google.');}
 }
 return <main className="login-screen">
  <div className="login-photo" aria-hidden="true"/>
  <div className="login-ribbon login-ribbon-top" aria-hidden="true"/>
  <div className="login-ribbon login-ribbon-bottom" aria-hidden="true"/>
  <header className="login-header">
   <Link className="login-brand" href="/" aria-label="Gevyro Aviation Academy">
    <Image className="gevyro-mark" src="/gevyro-logo.png" alt="Logo Gevyro" width={106} height={72} priority/>
    <span className="login-brand-rule"/>
    <span className="login-brand-type"><strong>Gevyro</strong><small>Aviation Academy</small></span>
   </Link>
  </header>
  <div className="login-layout">
   <section className="login-copy" aria-labelledby="login-title">
    <h1 id="login-title">Gevyro</h1>
    <p className="login-subtitle">Aviation Academy</p>
    <span className="login-blue-rule"/>
    <p className="login-description">Seu centro de estudos para<br className="desktop-break"/> Mecânica de Manutenção Aeronáutica.</p>
   </section>
   <section className="google-card" aria-label="Acesso à academia">
    <h2>Entre para continuar</h2>
    <button className="google-login-button" type="button" onClick={()=>void signIn()} disabled={busy||!supabase}>
     <GoogleIcon/>
     <span>{busy?'Conectando…':'Entrar com Google'}</span>
    </button>
    {(error||localError||callbackError)&&<p className="google-login-error" role="alert">{error||localError||'Não foi possível concluir o login com Google. Tente novamente.'}</p>}
   </section>
  </div>
 </main>;
}

function GoogleIcon(){return <svg className="google-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" transform="translate(0 4) scale(.9)"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94a11.1 11.1 0 0 1-4.8 7.27l7.73 6C44.38 38.16 46.98 31.96 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19z" transform="translate(0 3) scale(.92)"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.9 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -2) scale(.95)"/></svg>}
