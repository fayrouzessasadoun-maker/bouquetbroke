import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

function checkAdminAuth(request: Request): boolean {
  const password = request.headers.get('x-admin-password')
  return password === process.env.ADMIN_PASSWORD
}

export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ listings: data || [] })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
