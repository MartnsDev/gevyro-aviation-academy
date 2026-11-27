import {createServerClient,type CookieOptions} from '@supabase/ssr';
import {NextRequest,NextResponse} from 'next/server';
import {appUrl} from '@/modules/auth/site-url';

export async function GET(request:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return NextResponse.redirect(appUrl(request,'/?auth_error=google'));

 let cookiesToSet:{name:string;value:string;options:CookieOptions}[]=[];
 let cacheHeaders:Record<string,string>={};
 const supabase=createServerClient(url,key,{cookies:{
  getAll:()=>request.cookies.getAll(),
  setAll(cookies,headers){cookiesToSet=cookies;cacheHeaders=headers;},
 }});
 const redirectTo=appUrl(request,'/auth/callback').toString();
 const{data,error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo,queryParams:{prompt:'select_account'}}});
 if(error||!data.url)return NextResponse.redirect(appUrl(request,'/?auth_error=google'));

 const response=NextResponse.redirect(data.url,303);
 for(const cookie of cookiesToSet)response.cookies.set(cookie.name,cookie.value,cookie.options);
 for(const[name,value]of Object.entries(cacheHeaders))response.headers.set(name,value);
 return response;
}
