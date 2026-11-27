'use client';

import {useEffect,useMemo,useState} from 'react';
import {BookOpen,GraduationCap,Plus,Volume2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {message,save,useRecords} from '@/lib/db';
import {useSeedContent} from '@/lib/seed-content';
import {safetyExamples} from './content';
import {GuideCourse} from './guide-course';

function normalizeAnswer(value:string){return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');}

export function English({user,onError}:{user:string;onError:(text:string)=>void}){
 const contentReady=useSeedContent(user,onError);
 const vocabulary=useRecords(user,'vocabulary');
 const lessons=useRecords(user,'english_lessons');
 const exercises=useRecords(user,'english_exercises');
 const progress=useRecords(user,'lesson_progress');
 const settings=useRecords(user,'user_settings');
 const[tab,setTab]=useState('guide');
 const[query,setQuery]=useState('');
 const[category,setCategory]=useState('Todas');
 const[lesson,setLesson]=useState('');
 const[assessment,setAssessment]=useState(false);
 const[responses,setResponses]=useState<Record<string,string>>({});
 const[revealed,setRevealed]=useState(false);
 const[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
 const[voice,setVoice]=useState('');
 const[rate,setRate]=useState(.85);
 const[form,setForm]=useState(false);
 const[term,setTerm]=useState('');
 const[translation,setTranslation]=useState('');
 const[speech,setSpeech]=useState(false);
 const[level,setLevel]=useState('Todos');

 useEffect(()=>{
  setSpeech('speechSynthesis'in window);
  if(!('speechSynthesis'in window))return;
  const update=()=>setVoices(window.speechSynthesis.getVoices().filter(item=>item.lang.startsWith('en')));
  update();window.speechSynthesis.addEventListener('voiceschanged',update);
  const saved=settings.find(item=>item.data.voiceRate||item.data.voice);
  if(saved){setRate(Number(saved.data.voiceRate??.85));setVoice(String(saved.data.voice??''));}
  return()=>window.speechSynthesis.removeEventListener('voiceschanged',update);
 },[settings]);

 const speak=(text:string)=>{if(!speech){onError('Síntese de voz indisponível neste navegador.');return;}const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=rate;utterance.voice=voices.find(item=>item.name===voice)??null;window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);};
 const list=useMemo(()=>vocabulary.filter(item=>(category==='Todas'||item.data.category===category)&&`${item.data.term} ${item.data.translation}`.toLowerCase().includes(query.toLowerCase())),[vocabulary,category,query]);
 const current=lessons.find(item=>item.id===lesson);
 const practice=assessment?exercises.filter(item=>item.data.kind==='multiple').slice(0,12):exercises.filter(item=>item.parent_id===lesson);
 const matches=practice.filter(item=>normalizeAnswer(responses[item.id]??'')===normalizeAnswer(String(item.data.answer??''))).length;
 const allAnswered=practice.length>0&&practice.every(item=>!!responses[item.id]?.trim());
 const progressCount=progress.filter(item=>item.data.completed).length;

 if(!contentReady)return <div className="empty" role="status"><BookOpen size={36}/><h2>Preparando seu material de estudo</h2><p>As lições, questões e gabaritos serão guardados neste dispositivo e sincronizados com sua conta.</p></div>;

 async function checkPractice(){
  if(!allAnswered)return;
  setRevealed(true);
  try{const previous=progress.find(item=>item.parent_id===(lesson||'assessment'));await save(user,'lesson_progress',{lesson_id:lesson||'assessment',responses,correct:matches,total:practice.length,completed:matches===practice.length,assessment,suggested_level:matches<5?'Introdutório':matches<9?'Básico':'Intermediário'},previous?.id,lesson||null);}
  catch(error){onError(message(error));}
 }

 return <>
  <div className="page-heading"><div><span className="eyebrow">UNDERSTAND. CONNECT. LEARN.</span><h1>Inglês aeronáutico</h1><p>Treine leitura de manuais, escrita técnica e pronúncia.</p></div>{tab==='lessons'&&<Button variant="outline" onClick={()=>{setAssessment(true);setLesson('');setResponses({});setRevealed(false);}}>Avaliar meu nível</Button>}</div>
  <div className="english-banner"><GraduationCap size={45}/><div><span className="eyebrow">INGLÊS TÉCNICO PARA MANUTENÇÃO</span><h2>Da palavra à interpretação do manual.</h2><p>{vocabulary.length} termos · {lessons.length} lições · {exercises.length} exercícios de vocabulário</p></div><span className="badge light">Curso da apostila incluído</span></div>
  <div className="tabs">{[['guide','Curso da apostila'],['lessons','Treino de vocabulário'],['dictionary','Dicionário técnico'],['manuals','Interpretando manuais']].map(([value,label])=><button key={value} className={tab===value?'active':''} onClick={()=>{setTab(value);setLesson('');setAssessment(false);setResponses({});setRevealed(false);}}>{label}</button>)}</div>
  {tab==='guide'&&<GuideCourse user={user} onError={onError}/>}
  {tab!=='guide'&&<details className="voice-options panel"><summary>Áudio e acessibilidade</summary><div className="row"><label>Voz em inglês<select aria-label="Voz em inglês" value={voice} onChange={event=>setVoice(event.target.value)}><option value="">Voz padrão do navegador</option>{voices.map(item=><option key={item.name} value={item.name}>{item.name}</option>)}</select></label><label>Velocidade<input type="range" min=".5" max="1.5" step=".05" value={rate} onChange={event=>setRate(Number(event.target.value))}/></label></div><p className="muted">A reprodução depende das vozes disponíveis no dispositivo. Os exercícios de texto continuam disponíveis sem áudio.</p></details>}
  {tab==='lessons'&&!lesson&&!assessment&&<><div className="row"><label>Nível<select value={level} onChange={event=>setLevel(event.target.value)}>{['Todos','Introdutório','Básico','Intermediário','Técnico avançado'].map(item=><option key={item}>{item}</option>)}</select></label><span className="muted">{progressCount} lições concluídas</span></div>{lessons.filter(item=>level==='Todos'||item.data.level===level).length?<div className="lesson-grid">{lessons.filter(item=>level==='Todos'||item.data.level===level).sort((a,b)=>Number(a.data.order)-Number(b.data.order)).map((item,index)=><button className="panel lesson-card" key={item.id} onClick={()=>{setLesson(item.id);setResponses({});setRevealed(false);}}><div className="lesson-icon"><BookOpen size={24}/></div><span className="eyebrow">{String(item.data.level)} · LIÇÃO {index+1}</span><h3>{String(item.data.title)}</h3><p>{String(item.data.category)}</p><small>{progress.some(row=>row.parent_id===item.id&&row.data.completed)?'Concluída':'7 exercícios · aprox. 10 minutos'}</small></button>)}</div>:<p className="empty">Não há lições neste nível.</p>}</>}
  {(tab==='lessons'&&(lesson||assessment))&&<div className="panel"><Button variant="ghost" onClick={()=>{setLesson('');setAssessment(false);setResponses({});setRevealed(false);}}>Voltar às trilhas</Button><h2>{assessment?'Avaliação inicial de vocabulário':String(current?.data.title??'Lição')}</h2><p className="lesson-theory">{assessment?'Responda sem consultar o dicionário. O resultado sugere um ponto de partida e não equivale a uma certificação.':String(current?.data.theory??'')}</p>{practice.map((exercise,index)=><div className="english-exercise" key={exercise.id}><span className="eyebrow">EXERCÍCIO {index+1} · {String(exercise.data.kind)}</span><h3>{String(exercise.data.prompt)}</h3>{exercise.data.kind==='dictation'&&<><Button variant="outline" onClick={()=>speak(String(exercise.data.term))}><Volume2 size={16}/>Ouvir termo</Button><details><summary>Alternativa sem áudio</summary>{String(exercise.data.term)}</details></>}{exercise.data.kind==='multiple'?<select aria-label={`Resposta do exercício ${index+1}`} value={responses[exercise.id]??''} onChange={event=>setResponses(previous=>({...previous,[exercise.id]:event.target.value}))}><option value="">Selecione a tradução</option>{Array.from(new Set((exercise.data.options as string[]).filter(Boolean))).map(option=><option key={option} value={option}>{option}</option>)}</select>:<input aria-label={`Resposta do exercício ${index+1}`} value={responses[exercise.id]??''} onChange={event=>setResponses(previous=>({...previous,[exercise.id]:event.target.value}))} placeholder="Sua resposta"/>}{revealed&&<p className={`feedback ${normalizeAnswer(responses[exercise.id]??'')===normalizeAnswer(String(exercise.data.answer??''))?'correct':''}`}>Resposta de referência: {String(exercise.data.answer)}{normalizeAnswer(responses[exercise.id]??'')===normalizeAnswer(String(exercise.data.answer??''))?' · Correto':' · Confira a resposta e tente novamente.'}</p>}</div>)}{!practice.length&&<p>Esta lição ainda não tem exercícios disponíveis.</p>}<Button disabled={!allAnswered} onClick={()=>void checkPractice()}>{revealed?'Salvar tentativa':'Corrigir e salvar progresso'}</Button>{revealed&&<p role="status">{matches}/{practice.length} acertos.{assessment&&` Sugestão inicial: ${matches<5?'Introdutório':matches<9?'Básico':'Intermediário'}.`}</p>}</div>}
  {tab==='dictionary'&&<><div className="filters"><input aria-label="Pesquisar vocabulário" placeholder="Busque em inglês ou português…" value={query} onChange={event=>setQuery(event.target.value)}/><select aria-label="Categoria do termo" value={category} onChange={event=>setCategory(event.target.value)}><option>Todas</option>{Array.from(new Set(vocabulary.map(item=>String(item.data.category)))).map(item=><option key={item}>{item}</option>)}</select><Button variant="outline" onClick={()=>setForm(true)}><Plus size={16}/>Novo termo</Button></div><div className="vocabulary-list">{list.slice(0,80).map(item=><article className="panel vocabulary-card" key={item.id}><div className="row between"><h3>{String(item.data.term)} <span className="muted">/ {String(item.data.translation)}</span></h3><Button variant="ghost" size="icon" aria-label={`Ouvir ${item.data.term}`} onClick={()=>speak(String(item.data.term))}><Volume2 size={18}/></Button></div><span className="badge">{String(item.data.category)}</span><p>{String(item.data.definition)}</p><p className="english-example">{String(item.data.example)}</p><small>{String(item.data.context)}</small><Button variant="ghost" size="sm" onClick={()=>void save(user,'flashcards',{front:item.data.term,back:item.data.translation,deck:'Meu vocabulário',interval:0,ease:2.5,repetitions:0,due:new Date().toISOString()}).catch(error=>onError(message(error)))}>Adicionar aos flashcards</Button></article>)}</div>{list.length>80&&<p className="muted">Mostrando 80 de {list.length} termos. Refine a busca ou a categoria.</p>}</>}
  {tab==='manuals'&&<div className="lesson-grid">{safetyExamples.map(example=><article className="panel" key={example.text}><Button variant="ghost" size="icon" aria-label={`Ouvir ${example.text}`} onClick={()=>speak(example.text)}><Volume2 size={18}/></Button><h3 lang="en">{example.text}</h3><p>{example.translation}</p><dl><dt>Ação</dt><dd>{example.action}</dd><dt>Componente</dt><dd>{example.component}</dd><dt>Condição</dt><dd>{example.condition}</dd></dl><small>Exemplo de interpretação linguística. Não é procedimento operacional.</small></article>)}</div>}
  {form&&<div className="modal-backdrop"><form className="modal" onSubmit={async event=>{event.preventDefault();try{await save(user,'vocabulary',{term,translation,category:'Pessoal',definition:translation,example:'',context:'Cadastrado pelo estudante',status:'personal'});setForm(false);setTerm('');setTranslation('');}catch(error){onError(message(error));}}}><h2>Seu vocabulário pessoal</h2><label>Termo<input required value={term} onChange={event=>setTerm(event.target.value)}/></label><label>Tradução e observações<input required value={translation} onChange={event=>setTranslation(event.target.value)}/></label><div className="row end"><Button type="button" variant="outline" onClick={()=>setForm(false)}>Cancelar</Button><Button>Salvar termo</Button></div></form></div>}
 </>;
}
