import {createServerClient} from '@supabase/ssr';
import {NextRequest,NextResponse} from 'next/server';

export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get('code');
 if(!code)return NextResponse.redirect(new URL('/?auth_error=google',request.url));
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return NextResponse.redirect(new URL('/?auth_error=google',request.url));
 const response=NextResponse.redirect(new URL('/',request.url));
 const supabase=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(cookies){cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 const{error}=await supabase.auth.exchangeCodeForSession(code);
 if(error)return NextResponse.redirect(new URL('/?auth_error=google',request.url));
 return response;
}
