import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('OAuth callback route hit:', { code: code?.substring(0, 10) + '...', next, origin });

  if (code) {
    try {
      const supabase = await createClient();
      
      // Use getSession to check current session before exchange
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session before exchange:', !!sessionData?.session);
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('Auth exchange result:', { 
        hasSession: !!data?.session, 
        hasUser: !!data?.user, 
        error: error?.message 
      });
      
      if (!error && data?.session) {
        console.log('Redirecting to:', `${origin}${next}`);
        // Force a page reload to ensure session is properly set
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.log('Auth exchange failed:', error?.message);
      }
    } catch (err) {
      console.log('Exception in auth exchange:', err);
    }
  } else {
    console.log('No code parameter found');
  }

  // Return the user to an error page with instructions
  console.log('Redirecting to error page');
  return NextResponse.redirect(`${origin}/auth-code-error`);
}
