'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {Check,Mic,MicOff,RotateCcw,Volume2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {message,save,useRecords} from '@/lib/db';
import {guideLessons,pronunciationPhrases,simulatedReport,type GuideExercise,type GuideLesson} from './guide-content';

type RecognitionResult={transcript:string};
type RecognitionLike={lang:string;continuous:boolean;interimResults:boolean;onresult:((event:{results:ArrayLike<ArrayLike<RecognitionResult>>})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void};
type RecognitionConstructor=new()=>RecognitionLike;
type SpeechWindow=Window&{SpeechRecognition?:RecognitionConstructor;webkitSpeechRecognition?:RecognitionConstructor};

function normalize(text:string){return text.toLocaleLowerCase('en-US').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');}
function accepted(text:string,answers:string[]){const normalized=normalize(text);return !!normalized&&answers.some(answer=>normalize(answer)===normalized);}
function scorePhrase(expected:string,spoken:string){const a=normalize(expected).split(' ').filter(Boolean);const b=normalize(spoken).split(' ').filter(Boolean);if(!a.length||!b.length)return 0;let previous=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const current=[i];for(let j=1;j<=b.length;j++)current[j]=Math.min(current[j-1]+1,previous[j]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));previous=current;}return Math.max(0,Math.round((1-previous[b.length]/Math.max(a.length,b.length))*100));}
function includesAny(text:string,terms:string[]){const normalized=normalize(text);return terms.some(term=>normalized.includes(normalize(term)));}

export function GuideCourse({user,onError}:{user:string;onError:(text:string)=>void}){
 const savedProgress=useRecords(user,'lesson_progress');
 const[lessonId,setLessonId]=useState(guideLessons[0].id);
 const[answers,setAnswers]=useState<Record<string,string>>({});
 const[checked,setChecked]=useState(false);
 const[phraseIndex,setPhraseIndex]=useState(0);
 const[transcript,setTranscript]=useState('');
 const[recording,setRecording]=useState(false);
 const[voiceMessage,setVoiceMessage]=useState('');
 const[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
 const[voiceName,setVoiceName]=useState('');
 const[rate,setRate]=useState(.82);
 const[report,setReport]=useState<Record<string,string>>({});
 const[reportChecked,setReportChecked]=useState(false);
 const recognition=useRef<RecognitionLike|null>(null);
 const current=guideLessons.find(item=>item.id===lessonId)??guideLessons[0];
 const progress=savedProgress.filter(item=>item.data.course==='technical-english-guide');
 const completed=new Set(progress.filter(item=>item.data.completed).map(item=>String(item.data.lesson_id)));
 const score=useMemo(()=>current.exercises.filter(ex=>accepted(answers[ex.id]??'',ex.answers)).length,[answers,current]);
 const reportScore=simulatedReport.fields.filter(field=>field.checks.every(group=>includesAny(report[field.id]??'',group))).length;
 const phrase=pronunciationPhrases[phraseIndex];
 const pronunciationScore=transcript?scorePhrase(phrase.text,transcript):0;

 useEffect(()=>{
  if(!('speechSynthesis'in window))return;
  const update=()=>setVoices(window.speechSynthesis.getVoices().filter(item=>item.lang.toLowerCase().startsWith('en')));
  update();window.speechSynthesis.addEventListener('voiceschanged',update);
  return()=>window.speechSynthesis.removeEventListener('voiceschanged',update);
 },[]);
 useEffect(()=>()=>{recognition.current?.stop();if('speechSynthesis'in window)window.speechSynthesis.cancel();},[]);

 function selectLesson(item:GuideLesson){setLessonId(item.id);setAnswers({});setChecked(false);}
 function speak(text:string){if(!('speechSynthesis'in window)){setVoiceMessage('A reprodução de áudio não está disponível neste navegador.');return;}const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=rate;utterance.voice=voices.find(item=>item.name===voiceName)??null;window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);}
 function startMicrophone(){
  const SpeechAPI=(window as SpeechWindow).SpeechRecognition??(window as SpeechWindow).webkitSpeechRecognition;
  if(!SpeechAPI){setVoiceMessage('Este navegador não oferece reconhecimento de fala em inglês. Use o campo de digitação para praticar sem microfone.');return;}
  setVoiceMessage('');setTranscript('');const instance=new SpeechAPI();instance.lang='en-US';instance.continuous=false;instance.interimResults=false;
  instance.onresult=event=>{const words=Array.from(event.results).map(result=>result[0]?.transcript??'').join(' ').trim();setTranscript(words);if(words)void save(user,'english_exercises',{course:'technical-english-guide',kind:'pronunciation',prompt:phrase.text,spoken:words,similarity:scorePhrase(phrase.text,words),created_at:new Date().toISOString()}).catch(error=>onError(message(error)));};
  instance.onerror=event=>{setVoiceMessage(event.error==='not-allowed'?'Permita o uso do microfone para praticar. Você também pode digitar a frase.':`Não foi possível reconhecer a fala (${event.error}). Tente novamente ou digite a frase.`);setRecording(false);};
  instance.onend=()=>setRecording(false);recognition.current=instance;
  try{instance.start();setRecording(true);}catch(error){setRecording(false);setVoiceMessage(message(error));}
 }
 async function checkLesson(){
  setChecked(true);
  const allAnswered=current.exercises.every(item=>!!answers[item.id]?.trim());
  if(!allAnswered)return;
  try{await save(user,'lesson_progress',{course:'technical-english-guide',lesson_id:current.id,correct:score,total:current.exercises.length,completed:score===current.exercises.length,responses:answers,completed_at:new Date().toISOString()},`english-guide:${user}:${current.id}`,current.id);}
  catch(error){onError(message(error));}
 }
 async function checkReport(){
  setReportChecked(true);
  if(simulatedReport.fields.some(field=>!report[field.id]?.trim()))return;
  try{await save(user,'lesson_progress',{course:'technical-english-guide',lesson_id:'report-practice',correct:reportScore,total:simulatedReport.fields.length,completed:reportScore===simulatedReport.fields.length,responses:report,completed_at:new Date().toISOString()},`english-guide:${user}:report-practice`,'report-practice');}
  catch(error){onError(message(error));}
 }
 const allAnswered=current.exercises.every(item=>!!answers[item.id]?.trim());

 return <section className="guide-course">
  <div className="guide-intro panel"><div><span className="eyebrow">BASEADO NO GUIA DE INGLÊS TÉCNICO</span><h2>Leia, escreva e fale a linguagem dos manuais</h2><p>Trilha original baseada nos capítulos, no vocabulário e nos exercícios de “Como interpretar manuais de aeronaves em inglês” (apostila enviada).</p></div><span className="badge">{completed.size} de {guideLessons.length} unidades concluídas</span><p className="muted guide-disclaimer">Conteúdo didático. Os exemplos não são procedimentos de manutenção nem substituem manuais atualizados, dados aplicáveis ou orientação profissional.</p></div>
  <div className="guide-layout">
   <nav className="guide-units panel" aria-label="Unidades do curso">{guideLessons.map((item,index)=><button key={item.id} className={lessonId===item.id?'active':''} onClick={()=>selectLesson(item)}><span className="guide-unit-number">{completed.has(item.id)?<Check size={15}/>:String(index+1).padStart(2,'0')}</span><span><strong>{item.title}</strong><small>{item.chapter}</small></span></button>)}</nav>
   <article className="guide-lesson panel"><span className="eyebrow">{current.chapter}</span><h2>{current.title}</h2><p>{current.summary}</p><div className="guide-theory">{current.lesson}</div><h3>Pratique</h3>{current.exercises.map((item,index)=><Exercise key={item.id} exercise={item} index={index} value={answers[item.id]??''} revealed={checked} onChange={value=>setAnswers(previous=>({...previous,[item.id]:value}))}/>)}<div className="row between guide-actions"><Button variant="outline" onClick={()=>{setAnswers({});setChecked(false);}}><RotateCcw size={16}/>Limpar respostas</Button><Button onClick={()=>void checkLesson()} disabled={!allAnswered}>{checked?'Salvar novamente':'Corrigir unidade'}</Button></div>{checked&&<div className="guide-result" role="status"><strong>{score}/{current.exercises.length} respostas corretas</strong><p>{score===current.exercises.length?'Unidade concluída.':`Revise as respostas destacadas e use as explicações para tentar novamente.`}</p></div>}</article>
  </div>

  <section className="panel speaking-panel"><div className="section-heading"><div><span className="eyebrow">OUÇA E PRATIQUE</span><h2>Pronúncia com microfone</h2><p>Ouça a frase, repita em inglês e compare o que o navegador reconheceu.</p></div><span className="badge">Frase {phraseIndex+1} de {pronunciationPhrases.length}</span></div><label>Frase de treino<select value={phraseIndex} onChange={event=>{setPhraseIndex(Number(event.target.value));setTranscript('');setVoiceMessage('');}}>{pronunciationPhrases.map((item,index)=><option key={item.text} value={index}>{item.text}</option>)}</select></label><div className="pronunciation-target"><p lang="en">{phrase.text}</p><span>{phrase.translation}</span><small>{phrase.source}</small></div><div className="row"><Button variant="outline" onClick={()=>speak(phrase.text)}><Volume2 size={17}/>Ouvir modelo</Button><Button onClick={recording?()=>recognition.current?.stop():()=>startMicrophone()}>{recording?<><MicOff size={17}/>Parar gravação</>:<><Mic size={17}/>Falar com microfone</>}</Button></div><label className="voice-rate">Velocidade da voz modelo<input type="range" min=".65" max="1.1" step=".05" value={rate} onChange={event=>setRate(Number(event.target.value))}/></label>{voices.length>0&&<label>Voz em inglês<select value={voiceName} onChange={event=>setVoiceName(event.target.value)}><option value="">Padrão do navegador</option>{voices.map(item=><option value={item.name} key={item.name}>{item.name} · {item.lang}</option>)}</select></label>}<label>Ou digite o que você falou<input value={transcript} onChange={event=>setTranscript(event.target.value)} placeholder="A transcrição aparece aqui; também pode ser digitada"/></label>{voiceMessage&&<p className="notice subtle" role="status">{voiceMessage}</p>}{transcript&&<p className="pronunciation-result" role="status"><strong>Reconhecimento da frase: {pronunciationScore}% de semelhança</strong><span lang="en">Você disse: “{transcript}”</span><small>O navegador compara a transcrição com o modelo. Isso não mede sotaque nem substitui avaliação de um professor.</small></p>}</section>

  <section className="panel report-practice"><div className="section-heading"><div><span className="eyebrow">ESCRITA TÉCNICA</span><h2>{simulatedReport.title}</h2><p>{simulatedReport.prompt}</p></div><span className="badge">Exercício fictício</span></div><div className="report-scenario"><strong>Training aircraft:</strong> GAA-TRAINING-01 <span>·</span> <strong>Context:</strong> language practice only</div>{simulatedReport.fields.map(field=><label key={field.id}>{field.label}<textarea rows={field.id==='finding'||field.id==='status'?3:2} value={report[field.id]??''} onChange={event=>setReport(previous=>({...previous,[field.id]:event.target.value}))} placeholder={field.placeholder}/>{reportChecked&&<small className={field.checks.every(group=>includesAny(report[field.id]??'',group))?'report-pass':'report-review'}>{field.checks.every(group=>includesAny(report[field.id]??'',group))?'Campo contempla os elementos esperados.':'Revise este campo com base no modelo.'}</small>}</label>)}<div className="row"><Button onClick={()=>void checkReport()} disabled={simulatedReport.fields.some(field=>!report[field.id]?.trim())}>{reportChecked?'Reavaliar relatório':'Corrigir relatório'}</Button><Button variant="outline" onClick={()=>{setReport({});setReportChecked(false);}}>Limpar formulário</Button></div>{reportChecked&&<div className="guide-result" role="status"><strong>{reportScore}/{simulatedReport.fields.length} critérios atendidos</strong><details><summary>Ver modelo de resposta</summary><p>{simulatedReport.model}</p></details></div>}</section>
 </section>;
}

function Exercise({exercise,index,value,revealed,onChange}:{exercise:GuideExercise;index:number;value:string;revealed:boolean;onChange:(value:string)=>void}){
 const correct=accepted(value,exercise.answers);
 return <div className={`guide-exercise ${revealed?(correct?'is-correct':'needs-review'):''}`}><span className="eyebrow">EXERCÍCIO {index+1} · {exercise.kind==='choice'?'MÚLTIPLA ESCOLHA':exercise.kind==='fill'?'COMPLETE':exercise.kind==='order'?'ORDEM E TRADUÇÃO':'RESPOSTA CURTA'}</span><h4>{exercise.prompt}</h4>{exercise.kind==='choice'?<div className="guide-choices">{exercise.options?.map(option=><label key={option} className="guide-choice"><input type="radio" name={exercise.id} checked={value===option} onChange={()=>onChange(option)}/><span>{option}</span></label>)}</div>:<input value={value} onChange={event=>onChange(event.target.value)} placeholder={exercise.kind==='fill'?'Complete em inglês…':exercise.kind==='order'?'Digite a frase na ordem correta…':'Escreva sua resposta…'} lang={exercise.kind==='translate'?'pt-BR':'en'}/>}<details><summary>Dica</summary><p>{exercise.hint}</p></details>{revealed&&<div className="guide-feedback"><strong>{correct?'Correto':'Resposta de referência'}</strong>{!correct&&<p>{exercise.answers.join(' / ')}</p>}<small>{exercise.explanation}</small></div>}</div>;
}
