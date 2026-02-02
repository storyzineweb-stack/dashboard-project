import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)
  const isAdmin = ref(false)
  const initializing = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    if (initialized.value || initializing.value) return
    initializing.value = true

    const { data, error } = await supabase.auth.getSession()
    if (!error) {
      session.value = data.session
      user.value = data.session?.user ?? null
    }

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      void refreshAdminStatus()
    })

    await refreshAdminStatus()
    initialized.value = true
    initializing.value = false
  }

  async function refreshAdminStatus() {
    if (!user.value) {
      isAdmin.value = false
      return
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.value.id)
      .maybeSingle()

    if (error || !data) {
      isAdmin.value = false
      return
    }

    isAdmin.value = true
  }

  async function signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password })
  }

  async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  return {
    session,
    user,
    isAdmin,
    isAuthenticated,
    init,
    refreshAdminStatus,
    signUp,
    signIn,
    signOut
  }
})
