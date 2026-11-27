'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from './ui/button';

type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform: string };
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<InstallChoice> };

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [help, setHelp] = useState(false);
  const [ios, setIos] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isIosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const dismissed = sessionStorage.getItem('gevyro-install-dismissed') === '1';
    setIos(isIosDevice);
    if (!isStandalone && !dismissed) setVisible(true);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
      if (!dismissed) setVisible(true);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setVisible(false);
      setHelp(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('gevyro-install-dismissed', '1');
    setVisible(false);
    setHelp(false);
  };

  const install = async () => {
    if (!installEvent) {
      setHelp(true);
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === 'accepted') dismiss();
  };

  if (!visible) return null;

  return <>
    <aside className="install-prompt" aria-label="Instalar Gevyro Aviation Academy">
      <span className="install-prompt-icon"><Download size={19}/></span>
      <div className="install-prompt-copy">
        <strong>Instale o app Gevyro</strong>
        <span>Acesse sua academia direto pela tela inicial.</span>
      </div>
      <Button size="sm" onClick={() => void install()}>{installEvent ? 'Instalar' : 'Como instalar'}</Button>
      <button className="install-prompt-close" aria-label="Agora não" onClick={dismiss}><X size={18}/></button>
    </aside>
    {help && <div className="install-help-backdrop" onClick={() => setHelp(false)}>
      <section className="install-help" role="dialog" aria-modal="true" aria-labelledby="install-help-title" onClick={(event) => event.stopPropagation()}>
        <button className="install-prompt-close" aria-label="Fechar instruções" onClick={() => setHelp(false)}><X size={18}/></button>
        <span className="install-prompt-icon">{ios ? <Share size={19}/> : <Download size={19}/>}</span>
        <h2 id="install-help-title">Instalar Gevyro no dispositivo</h2>
        <p>{ios
          ? <>No Safari, toque em <strong>Compartilhar</strong> <Share size={15} className="install-inline-icon"/> e escolha <strong>Adicionar à Tela de Início</strong>.</>
          : <>Abra o menu do navegador e escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</>}</p>
        <Button onClick={dismiss}>Entendi</Button>
      </section>
    </div>}
  </>;
}
