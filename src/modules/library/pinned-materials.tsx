'use client';
import {useState} from 'react';
import {BookOpen,Download,LoaderCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {download,message} from '@/lib/db';
import {getOriginal} from '@/modules/sync/service';
import {ensureCourseMaterial} from './service';
import {courseMaterials} from './course-materials';

export function PinnedMaterials({user,open,onError}:{user:string;open:(id:string)=>void;onError?:(error:string)=>void}){
 const[busy,setBusy]=useState('');
 const[error,setError]=useState('');
 async function run(slug:string,action:'open'|'download',title:string){setBusy(`${action}:${slug}`);setError('');try{const id=await ensureCourseMaterial(user,slug);if(action==='open')open(id);else download(await getOriginal(user,id),`${title}.pdf`);}catch(error){const text=message(error);setError(text);onError?.(text);}finally{setBusy('');}}
 return <section className="pinned-materials" aria-labelledby="pinned-materials-title"><div className="pinned-heading"><div><span className="eyebrow">ACERVO FIXO DO CURSO</span><h2 id="pinned-materials-title">Apostilas MMA <span>{courseMaterials.length}</span></h2><p>Materiais disponíveis assim que você entra na academia.</p></div></div>{error&&<p className="error-text" role="alert">{error}</p>}<div className="pinned-grid">{courseMaterials.map((material,index)=><article className="pinned-card" key={material.slug}><span className={`pinned-icon pinned-icon-${index%4}`}><BookOpen size={20}/></span><div className="pinned-copy"><h3>{material.title}</h3><p>{material.subject}</p><small>{material.pages} páginas · {material.source}</small></div><div className="pinned-actions"><Button size="sm" disabled={!!busy} onClick={()=>void run(material.slug,'open',material.title)}>{busy===`open:${material.slug}`?<LoaderCircle size={15} className="spin"/>:<BookOpen size={15}/>}Abrir no leitor</Button><Button size="sm" variant="ghost" disabled={!!busy} onClick={()=>void run(material.slug,'download',material.title)}>{busy===`download:${material.slug}`?<LoaderCircle size={15} className="spin"/>:<Download size={15}/>}Baixar PDF</Button></div></article>)}</div><p className="pinned-note">O leitor abre a apostila completa; o arquivo é carregado quando você seleciona o material.</p></section>;
}
