import {describe,it,expect,beforeEach} from 'vitest';
import {PDFDocument} from 'pdf-lib';
import {db,save,softDelete,clearUser} from '@/lib/db';
import {validatePdf,sha256} from '@/lib/validation';
import {sm2} from '@/modules/flashcards/sm2';
import {parseQuestions,parseAnswerKeys,grade,shuffle} from '@/modules/exercises/parser';
import {exportActivities} from '@/modules/exercises/export';
import {createBackup,inspectBackup,restoreBackup} from '@/modules/backup/service';
import {centerOfGravity,finite,divide} from '@/modules/calculators/engine';
import {terms,lessonTopics} from '@/modules/english/content';
import {seedContent} from '@/lib/seed';
const user='f0000000-0000-4000-8000-000000000001';const other='f0000000-0000-4000-8000-000000000002';
beforeEach(async()=>{await db.records.clear();await db.operations.clear();await db.files.clear();});
describe('PDF and persistence',()=>{
 it('validates original, hashes all bytes, rejects invalid and oversize files',async()=>{const pdf=await PDFDocument.create();pdf.addPage();const b=new Blob([new Uint8Array(await pdf.save())]);await expect(validatePdf(b)).resolves.toBeUndefined();expect(await sha256(b)).toMatch(/^[a-f0-9]{64}$/);await expect(validatePdf(new Blob(['fake']))).rejects.toThrow('PDF');await expect(validatePdf(new Blob([new Uint8Array(50*1024*1024+1)]))).rejects.toThrow('50 MB');});
 it('preserves completed and visited as independent data and rejects cross-owner writes',async()=>{const id=await save(user,'reading_progress',{page:7,visited:[1,7],completed:[1],zoom:1.2,scroll:500});expect((await db.records.get(id))?.data.completed).toEqual([1]);await expect(save(other,'reading_progress',{},id)).rejects.toThrow('outro usuário');expect(await db.operations.count()).toBe(1);await save(user,'reading_progress',{page:8},id);expect(await db.operations.count()).toBe(1);});
 it('soft deletes and restores annotations',async()=>{const id=await save(user,'annotations',{body:'Revisar corrosão',page:2,rects:[[.1,.2,.3,.04]]});await softDelete(user,id);expect((await db.records.get(id))?.deleted_at).toBeTruthy();await softDelete(user,id,true);expect((await db.records.get(id))?.deleted_at).toBeNull();await clearUser(other);expect(await db.records.count()).toBe(1);});
});
describe('workbook',()=>{
 it('preserves numbering, alternatives and page without inventing a key',()=>{const q=parseQuestions('Capítulo 2\n12. Qual termo?\na) bolt\nb) nut\n13. Explique a diferença.', 'doc',4);expect(q).toHaveLength(2);expect(q[0]).toMatchObject({number:'12',page:4,kind:'multiple',options:['bolt','nut']});expect(q[1].kind).toBe('essay');expect(grade('0')).toBeNull();});
 it('requires provenance in imported answer keys',()=>{expect(parseAnswerKeys('numero,resposta,fonte\n12,A,Material autorizado')[0].answer).toBe('A');expect(()=>parseAnswerKeys('numero,resposta\n12,A')).toThrow('fonte');});
 it('preserves option identity through shuffle',()=>{const options=[{id:0,text:'correct'},{id:1,text:'wrong'},{id:2,text:'other'}];expect(shuffle(options,()=>0).find(o=>o.id===0)?.text).toBe('correct');expect(options[0].id).toBe(0);});
 it('exports valid A4 PDF and preserves original export input',async()=>{const q=parseQuestions('1. Conceito?\na) Um\nb) Dois','doc')[0];const out=await exportActivities({name:'Estudante',institution:'EDAPA'},[{question:q,answer:'0'}],{cover:true,corrections:false});const pdf=await PDFDocument.load(await out.arrayBuffer());expect(pdf.getPages()[0].getSize().width).toBeCloseTo(595.28);expect(pdf.getPageCount()).toBeGreaterThan(1);const original=new Blob([new Uint8Array(await pdf.save())]);const hash=await sha256(original);await exportActivities({},[{question:q,answer:'Resposta',x:.1,y:.3}],{cover:false,corrections:false,original});expect(await sha256(original)).toBe(hash);});
});
describe('backup',()=>{
 it('round-trips original PDFs, notes and responses without overwriting duplicates',async()=>{const pdf=await PDFDocument.create();pdf.addPage();const blob=new Blob([new Uint8Array(await pdf.save())]);const hash=await sha256(blob);const id=await save(user,'documents',{title:'Original',hash,pages:1,size:blob.size});await db.files.put({id,user_id:user,hash,blob,uploaded:false});const note=await save(user,'annotations',{body:'Nota de estudo',page:1},undefined,id);await save(user,'question_answers',{answer:'Resposta discursiva'});const zip=await createBackup(user);const analysis=await inspectBackup(zip,user);expect(analysis.duplicates).toBe(3);await save(user,'annotations',{body:'Nota alterada'},note,id);await restoreBackup(user,analysis,false);expect((await db.records.get(note))?.data.body).toBe('Nota alterada');await clearUser(user);await restoreBackup(user,await inspectBackup(zip,user));expect(await db.records.count()).toBe(3);expect(await sha256((await db.files.get(id))!.blob)).toBe(hash);});
 it('refuses invalid archive',async()=>{await expect(inspectBackup(new Blob(['bad']),user)).rejects.toThrow();});
});
describe('learning and calculations',()=>{
 it('SM2 schedules success and failure',()=>{const card={interval:0,ease:2.5,repetitions:0};expect(sm2(card,4,new Date('2026-01-01T12:00:00Z')).interval).toBe(1);expect(sm2({...card,repetitions:1},4).interval).toBe(6);expect(sm2({...card,interval:20,repetitions:5},1).repetitions).toBe(0);expect(()=>sm2(card,7)).toThrow();});
 it('validates units and division',()=>{expect(finite('2,5')).toBe(2.5);expect(()=>finite('')).toThrow();expect(()=>divide(3,0)).toThrow();expect(centerOfGravity([{weight:100,arm:2},{weight:50,arm:4}]).cg).toBeCloseTo(8/3);expect(()=>centerOfGravity([{weight:-1,arm:2}])).toThrow();});
 it('provides seed counts and installs without duplicating records',async()=>{expect(terms.length).toBeGreaterThanOrEqual(300);expect(lessonTopics.length).toBe(30);await seedContent(user);const all=await db.records.toArray();expect(all.filter(r=>r.entity==='questions')).toHaveLength(150);expect(all.filter(r=>r.entity==='english_exercises').length).toBeGreaterThanOrEqual(200);const n=all.length;await seedContent(user);expect(await db.records.count()).toBe(n);expect(all.filter(r=>r.entity==='questions').every(q=>q.data.status==='pending_review')).toBe(true);});
});
