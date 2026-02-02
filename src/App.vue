<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import NotificationContainer from '@/components/NotificationContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const isMobileMenuOpen = ref(false)

type MenuItem = {
  id: string
  label: string
  link_url: string | null
  parent_id: string | null
  order_index: number
}

const menus = ref<MenuItem[]>([])

const rootMenus = computed(() => {
  const roots = menus.value.filter((menu) => !menu.parent_id)
  return roots.map((menu) => ({
    ...menu,
    children: menus.value
      .filter((child) => child.parent_id === menu.id)
      .sort((a, b) => a.order_index - b.order_index)
  }))
})

const isExternalLink = (value?: string | null) => {
  if (!value) return false
  return value.startsWith('http://') || value.startsWith('https://')
}

const userLabel = computed(() => {
  if (!authStore.user) return ''
  return authStore.user.email ?? '사용자'
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = () => {
  authStore.signOut()
  closeMobileMenu()
}

const loadMenus = async () => {
  const { data } = await supabase
    .from('cms_menus')
    .select('id,label,link_url,parent_id,order_index')
    .order('order_index', { ascending: true })

  menus.value = data ?? []
}

onMounted(loadMenus)
</script>

<template>
  <div class="app-shell">
    <header class="top-bar">
      <RouterLink to="/" class="brand" @click="closeMobileMenu">Acme Solutions</RouterLink>
      <nav class="top-nav">
        <RouterLink to="/" class="nav-link" @click="closeMobileMenu">Home</RouterLink>
        <div v-for="menu in rootMenus" :key="menu.id" class="nav-item">
          <RouterLink
            v-if="menu.link_url && !isExternalLink(menu.link_url)"
            :to="menu.link_url"
            class="nav-link"
            @click="closeMobileMenu"
          >
            {{ menu.label }}
          </RouterLink>
          <a
            v-else-if="menu.link_url"
            :href="menu.link_url"
            class="nav-link"
            target="_blank"
            rel="noopener"
          >
            {{ menu.label }}
          </a>
          <span v-else class="nav-link dropdown-trigger">{{ menu.label }}</span>

          <div v-if="menu.children.length" class="submenu">
            <div v-for="child in menu.children" :key="child.id">
              <RouterLink
                v-if="child.link_url && !isExternalLink(child.link_url)"
                :to="child.link_url"
                class="submenu-link"
                @click="closeMobileMenu"
              >
                {{ child.label }}
              </RouterLink>
              <a
                v-else-if="child.link_url"
                :href="child.link_url"
                class="submenu-link"
                target="_blank"
                rel="noopener"
              >
                {{ child.label }}
              </a>
              <span v-else class="submenu-link">{{ child.label }}</span>
            </div>
          </div>
        </div>
        <RouterLink
          v-if="isAdmin"
          to="/admin"
          class="nav-link"
          @click="closeMobileMenu"
        >
          Admin
        </RouterLink>
        <RouterLink
          v-if="isAdmin"
          to="/admin/banners"
          class="nav-link"
          @click="closeMobileMenu"
        >
          Banners
        </RouterLink>
        <RouterLink
          v-if="isAdmin"
          to="/admin/seo"
          class="nav-link"
          @click="closeMobileMenu"
        >
          SEO
        </RouterLink>
        <RouterLink
          v-if="isAdmin"
          to="/admin/pages"
          class="nav-link"
          @click="closeMobileMenu"
        >
          Pages
        </RouterLink>
        <RouterLink
          v-if="isAdmin"
          to="/admin/menus"
          class="nav-link"
          @click="closeMobileMenu"
        >
          Menus
        </RouterLink>
        <RouterLink
          v-if="isAuthenticated"
          to="/posts/new"
          class="nav-link primary"
          @click="closeMobileMenu"
        >
          New Post
        </RouterLink>
      </nav>
      <div class="auth-nav">
        <span v-if="isAuthenticated" class="user-label">{{ userLabel }}</span>
        <RouterLink v-if="!isAuthenticated" to="/login" class="nav-link" @click="closeMobileMenu">
          Login
        </RouterLink>
        <RouterLink
          v-if="!isAuthenticated"
          to="/signup"
          class="nav-link primary"
          @click="closeMobileMenu"
        >
          Sign Up
        </RouterLink>
        <button
          v-if="isAuthenticated"
          class="nav-link ghost"
          type="button"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
      <button class="mobile-toggle" type="button" @click="toggleMobileMenu">
        {{ isMobileMenuOpen ? '닫기' : '메뉴' }}
      </button>
    </header>

    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
    <aside :class="['mobile-menu', { open: isMobileMenuOpen }]">
      <RouterLink to="/" class="mobile-link" @click="closeMobileMenu">Home</RouterLink>
      <div v-for="menu in rootMenus" :key="menu.id" class="mobile-group">
        <RouterLink
          v-if="menu.link_url && !isExternalLink(menu.link_url)"
          :to="menu.link_url"
          class="mobile-link"
          @click="closeMobileMenu"
        >
          {{ menu.label }}
        </RouterLink>
        <a
          v-else-if="menu.link_url"
          :href="menu.link_url"
          class="mobile-link"
          target="_blank"
          rel="noopener"
        >
          {{ menu.label }}
        </a>
        <span v-else class="mobile-link">{{ menu.label }}</span>

        <div v-if="menu.children.length" class="mobile-submenu">
          <div v-for="child in menu.children" :key="child.id">
            <RouterLink
              v-if="child.link_url && !isExternalLink(child.link_url)"
              :to="child.link_url"
              class="mobile-link sub"
              @click="closeMobileMenu"
            >
              {{ child.label }}
            </RouterLink>
            <a
              v-else-if="child.link_url"
              :href="child.link_url"
              class="mobile-link sub"
              target="_blank"
              rel="noopener"
            >
              {{ child.label }}
            </a>
            <span v-else class="mobile-link sub">{{ child.label }}</span>
          </div>
        </div>
      </div>
      <RouterLink
        v-if="isAdmin"
        to="/admin"
        class="mobile-link"
        @click="closeMobileMenu"
      >
        Admin
      </RouterLink>
      <RouterLink
        v-if="isAdmin"
        to="/admin/banners"
        class="mobile-link"
        @click="closeMobileMenu"
      >
        Banners
      </RouterLink>
      <RouterLink
        v-if="isAdmin"
        to="/admin/seo"
        class="mobile-link"
        @click="closeMobileMenu"
      >
        SEO
      </RouterLink>
      <RouterLink
        v-if="isAdmin"
        to="/admin/pages"
        class="mobile-link"
        @click="closeMobileMenu"
      >
        Pages
      </RouterLink>
      <RouterLink
        v-if="isAdmin"
        to="/admin/menus"
        class="mobile-link"
        @click="closeMobileMenu"
      >
        Menus
      </RouterLink>
      <RouterLink
        v-if="isAuthenticated"
        to="/posts/new"
        class="mobile-link"
        @click="closeMobileMenu"
      >
        New Post
      </RouterLink>
      <RouterLink v-if="!isAuthenticated" to="/login" class="mobile-link" @click="closeMobileMenu">
        Login
      </RouterLink>
      <RouterLink v-if="!isAuthenticated" to="/signup" class="mobile-link" @click="closeMobileMenu">
        Sign Up
      </RouterLink>
      <button
        v-if="isAuthenticated"
        class="mobile-link ghost"
        type="button"
        @click="handleLogout"
      >
        Logout
      </button>
    </aside>

    <main class="main-content">
      <RouterView />
    </main>

    <NotificationContainer />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--color-background);
  overflow-x: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  flex-wrap: wrap;
}

.brand {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-heading);
  text-decoration: none;
}

.top-nav {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.nav-item {
  position: relative;
}

.dropdown-trigger {
  cursor: default;
}

.submenu {
  display: none;
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  min-width: 180px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.nav-item:hover .submenu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.submenu-link {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
}

.submenu-link:hover {
  background: var(--color-background-soft);
}

.auth-nav {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.user-label {
  font-size: 0.9rem;
  opacity: 0.7;
  padding-right: 0.5rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid transparent;
  transition: all 0.2s ease;
  background: transparent;
  cursor: pointer;
}

.nav-link:hover {
  border-color: var(--color-border);
  background: var(--color-background);
}

.nav-link.primary {
  background: #667eea;
  color: white;
}

.nav-link.ghost {
  border-color: var(--color-border);
}

.mobile-toggle {
  display: none;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
}

.mobile-menu {
  display: none;
}

.mobile-overlay {
  display: none;
}

.nav-link.router-link-active:not(.primary) {
  border-color: #667eea;
  color: #667eea;
}

.main-content {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  padding-top: 0;
}

@media (max-width: 720px) {
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .top-nav {
    display: none;
  }

  .auth-nav {
    display: none;
  }

  .mobile-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    z-index: 20;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: min(80vw, 320px);
    background: var(--color-background);
    border-left: 1px solid var(--color-border);
    transform: translateX(100%);
    transition: transform 0.25s ease;
    z-index: 30;
  }

  .mobile-menu.open {
    transform: translateX(0);
  }

  .mobile-link {
    padding: 0.6rem 1rem;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    text-decoration: none;
    color: var(--color-text);
    background: var(--color-background-soft);
    cursor: pointer;
  }

  .mobile-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-submenu {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding-left: 0.75rem;
  }

  .mobile-link.sub {
    font-size: 0.9rem;
  }

  .mobile-link.ghost {
    background: transparent;
  }

  .main-content {
    padding: 1.5rem;
  }
}
</style>
