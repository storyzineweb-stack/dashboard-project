import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'
import HomeView from '../views/HomeView.vue'
import PostsListView from '../views/PostsListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/posts',
      name: 'posts',
      component: PostsListView,
    },
    {
      path: '/notice',
      name: 'notice',
      component: PostsListView,
      props: { category: 'notice' },
    },
    {
      path: '/news',
      name: 'news',
      component: PostsListView,
      props: { category: 'news' },
    },
    {
      path: '/free',
      name: 'free',
      component: PostsListView,
      props: { category: 'free' },
    },
    {
      path: '/posts/new',
      name: 'post-create',
      component: () => import('../views/PostCreateView.vue'),
    },
    {
      path: '/posts/:id',
      name: 'post-detail',
      component: () => import('../views/PostDetailView.vue'),
      props: true,
    },
    {
      path: '/posts/:id/edit',
      name: 'post-edit',
      component: () => import('../views/PostEditView.vue'),
      props: true,
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import('../views/GalleryView.vue'),
    },
    {
      path: '/admin/inquiries',
      name: 'admin-inquiries',
      component: () => import('../views/AdminInquiriesView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/inquiries/:id',
      name: 'admin-inquiry-detail',
      component: () => import('../views/AdminInquiryDetailView.vue'),
      props: true,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboardView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/banners',
      name: 'admin-banners',
      component: () => import('../views/AdminBannersView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/pages',
      name: 'admin-pages',
      component: () => import('../views/AdminPagesView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/menus',
      name: 'admin-menus',
      component: () => import('../views/AdminMenusView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/seo',
      name: 'admin-seo',
      component: () => import('../views/AdminSeoView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/page/:slug',
      name: 'cms-page',
      component: () => import('../views/CmsPageView.vue'),
      props: true,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
    },
  ],
})

type SeoSettings = {
  page_key: string
  title: string | null
  description: string | null
  og_image_url: string | null
}

let seoCache: Record<string, SeoSettings> | null = null

const loadSeoSettings = async () => {
  if (seoCache) return seoCache

  const { data } = await supabase
    .from('seo_settings')
    .select('page_key,title,description,og_image_url')

  const map: Record<string, SeoSettings> = {}
  data?.forEach((row) => {
    map[row.page_key] = row
  })

  seoCache = map
  return map
}

const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const resolvePageKey = (name?: string | symbol) => {
  if (name === 'home') return 'home'
  if (name === 'notice') return 'notice'
  if (name === 'news') return 'news'
  if (name === 'free') return 'free'
  if (name === 'gallery') return 'gallery'
  if (name === 'contact') return 'contact'
  return 'global'
}

const applySeo = async (routeName?: string | symbol) => {
  const settings = await loadSeoSettings()
  const global = settings.global
  const pageKey = resolvePageKey(routeName)
  const page = settings[pageKey]

  const title = page?.title || global?.title || 'Website'
  const description = page?.description || global?.description || ''
  const ogImage = page?.og_image_url || global?.og_image_url || ''

  document.title = title
  if (description) {
    setMetaTag('name', 'description', description)
    setMetaTag('property', 'og:description', description)
  }
  setMetaTag('property', 'og:title', title)
  setMetaTag('property', 'og:url', window.location.href)
  if (ogImage) {
    setMetaTag('property', 'og:image', ogImage)
  }
}

router.beforeEach(async (to) => {
  const requiresAuth = !!to.meta.requiresAuth || !!to.meta.requiresAdmin
  if (!requiresAuth) return true

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!data.session) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!to.meta.requiresAdmin) return true

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.session.user.id)
    .maybeSingle()

  if (adminError || !adminRow) {
    return { name: 'home' }
  }

  return true
})

router.afterEach((to) => {
  void applySeo(to.name)
})

export default router
