'use client';

import {useEffect,useState} from 'react';
import {db,save} from './db';
import {seedContent} from './seed';

const inFlight=new Map<string,Promise<void>>();

export async function ensureSeedContent(user:string){
 if(!user||user==='local')return;
 const markerId=`gevyro-content-v2:${user}`;
 const marker=await db.records.get(markerId);
 if(marker?.user_id===user)return;
 let task=inFlight.get(user);
 if(!task){
  task=(async()=>{
   await seedContent(user);
   await save(user,'english_courses',{kind:'seed-marker',version:2,completed_at:new Date().toISOString()},markerId);
  })();
  inFlight.set(user,task);
 }
 try{await task;}finally{if(inFlight.get(user)===task)inFlight.delete(user);}
}

export function useSeedContent(user:string,onError:(message:string)=>void){
 const[ready,setReady]=useState(user==='local');
 useEffect(()=>{
  let active=true;
  if(!user||user==='local'){setReady(true);return()=>{active=false;};}
  setReady(false);
  void ensureSeedContent(user).then(()=>{if(active)setReady(true);}).catch(error=>{
   if(active)onError(error instanceof Error?error.message:'Não foi possível preparar os exercícios. Tente novamente.');
  });
  return()=>{active=false;};
 },[user,onError]);
 return ready;
}
