import {NextRequest} from 'next/server';

const PRODUCTION_SITE_URL='https://gevyro-aviation-academy.vercel.app';

export function appUrl(request:NextRequest,path:string,options?:{production?:boolean;configuredSiteUrl?:string}){
 let origin=request.nextUrl.origin;
 if(options?.production??process.env.NODE_ENV==='production'){
  const configured=(options?.configuredSiteUrl??process.env.NEXT_PUBLIC_SITE_URL)?.trim();
  if(configured){
   try{
    const candidate=new URL(configured.startsWith('http')?configured:`https://${configured}`);
    origin=candidate.protocol==='https:'&&candidate.hostname!=='localhost'?candidate.origin:PRODUCTION_SITE_URL;
   }catch{origin=PRODUCTION_SITE_URL;}
  }else origin=PRODUCTION_SITE_URL;
 }
 return new URL(path,origin);
}
