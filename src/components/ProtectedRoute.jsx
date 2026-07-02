import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../config/supabaseClient'

export default function ProtectedRoute() {
  // undefined = still checking; null = no session; object = authenticated
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // 1. Resolve existing session immediately
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })

    // 2. Keep in sync with auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Checking session — show minimal spinner so the page doesn't flash
  if (session === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#012626' }}
        aria-label="جارٍ التحقق من صلاحيات الدخول"
      >
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(217,172,163,0.20)', borderTopColor: '#D9ACA3' }}
        />
      </div>
    )
  }

  // No active session — redirect to login, preserve intended destination
  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  // Authenticated — render the protected child route
  return <Outlet />
}
