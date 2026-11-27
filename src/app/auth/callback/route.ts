import {createServerClient} from '@supabase/ssr';
import {NextRequest,NextResponse} from 'next/server';
import {appUrl} from '@/modules/auth/site-url';

export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get('code');
 if(!code)return NextResponse.redirect(appUrl(request,'/?auth_error=google'));
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return NextResponse.redirect(appUrl(request,'/?auth_error=google'));
 const response=NextResponse.redirect(appUrl(request,'/'));
 const supabase=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(cookies){cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 const{error}=await supabase.auth.exchangeCodeForSession(code);
 if(error)return NextResponse.redirect(appUrl(request,'/?auth_error=google'));
 return response;
}
