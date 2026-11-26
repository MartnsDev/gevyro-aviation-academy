export const tables = ['profiles','study_modules','subjects','collections','documents','document_pages','reading_progress','reading_sessions','bookmarks','highlights','annotations','exercise_workbooks','exercise_sections','questions','question_options','answer_keys','exercise_attempts','question_answers','exams','exam_attempts','flashcard_decks','flashcards','flashcard_reviews','vocabulary','english_courses','english_lessons','english_exercises','lesson_progress','study_goals','study_tasks','study_sessions','user_settings','sync_operations'] as const;
export type EntityTable = typeof tables[number];
export type Payload = Record<string, unknown>;
export interface RecordRow { id:string; user_id:string; entity:EntityTable; data:Payload; version:number; updated_at:string; deleted_at:string|null; parent_id:string|null; }
export interface Operation {id:string; user_id:string; record_id:string; entity:EntityTable; base_version:number; status:'pending'|'error'|'conflict'; error?:string; remote?:RecordRow; created_at:string;}
export interface StoredFile {id:string;user_id:string;blob:Blob;hash:string; uploaded:boolean;}
export interface Doc extends Payload { title:string;description:string;category:string;subject:string;institution:string;edition:string;pages:number;size:number;hash:string;cover:string;favorite:boolean;localOnly:boolean;collection:string; }
export interface Progress extends Payload {document_id:string;page:number;zoom:number;mode:string;scroll:number;visited:number[];completed:number[];}
export interface Question extends Payload { number:string;prompt:string;options:string[];kind:'multiple'|'boolean'|'essay'|'calculation'|'matching'|'fill';subject:string;chapter:string;page:number;document_id:string;origin:string;status:string;explanation:string; }
export interface Card extends Payload {front:string;back:string;deck:string;interval:number;ease:number;repetitions:number;due:string;}
export const categories=['Básico','Célula','GMP','Aviônicos','Inglês Técnico','Manuais','Complementares'];
export const disclaimer='Conteúdo educacional. Não substitui documentação aprovada, atualizada e aplicável à aeronave, nem supervisão profissional.';
