<template>
  <section v-if="banners.length" class="banner-section">
    <div class="banner-track" :style="{ transform: `translateX(-${activeIndex * 100}%)` }">
      <article v-for="banner in banners" :key="banner.id" class="banner-slide">
        <img :src="banner.image_url" :alt="banner.title || 'banner'" />
        <div class="banner-content">
          <p v-if="banner.subtitle" class="banner-subtitle">{{ banner.subtitle }}</p>
          <h2 v-if="banner.title">{{ banner.title }}</h2>
          <RouterLink v-if="banner.link_url" :to="banner.link_url" class="primary-button">
            자세히 보기
          </RouterLink>
        </div>
      </article>
    </div>

    <button v-if="hasMultipleBanners" class="banner-nav prev" type="button" @click="prevBanner">
      ‹
    </button>
    <button v-if="hasMultipleBanners" class="banner-nav next" type="button" @click="nextBanner">
      ›
    </button>

    <div v-if="hasMultipleBanners" class="banner-dots">
      <button
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="dot"
        :class="{ active: index === activeIndex }"
        type="button"
        @click="goToBanner(index)"
      ></button>
    </div>
  </section>

  <section class="hero">
    <div class="hero-content">
      <p class="eyebrow">Acme Solutions</p>
      <h1>신뢰할 수 있는 디지털 파트너</h1>
      <p class="subtitle">
        고객 경험을 개선하는 웹 서비스와 데이터 기반 대시보드를 제공합니다.
      </p>
      <div class="hero-actions">
        <RouterLink to="/posts" class="primary-button">공지/게시판 보기</RouterLink>
        <RouterLink to="/contact" class="ghost-button">견적/문의하기</RouterLink>
        <RouterLink to="/gallery" class="ghost-button">포토갤러리</RouterLink>
        <RouterLink to="/signup" class="ghost-button">회원가입</RouterLink>
      </div>
    </div>
    <div class="hero-card">
      <h2>이번 달 하이라이트</h2>
      <ul>
        <li>✓ 신규 고객사 12곳 온보딩</li>
        <li>✓ 평균 응답 시간 28% 개선</li>
        <li>✓ SaaS 전환 프로젝트 5건 완료</li>
      </ul>
    </div>
  </section>

  <section class="section">
    <h2>우리가 제공하는 서비스</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>제품 전략</h3>
        <p>비즈니스 목표에 맞는 MVP 설계와 로드맵을 제안합니다.</p>
      </div>
      <div class="feature-card">
        <h3>개발 & 운영</h3>
        <p>안정적인 인프라와 자동화된 운영 체계를 구축합니다.</p>
      </div>
      <div class="feature-card">
        <h3>데이터 분석</h3>
        <p>실시간 지표와 인사이트로 의사결정을 지원합니다.</p>
      </div>
    </div>
  </section>

  <section class="section info-grid">
    <div>
      <h2>고객센터</h2>
      <p>평일 09:00 ~ 18:00</p>
      <p>help@acme.co.kr | 02-123-4567</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'

type Banner = {
  id: string
  image_url: string
  title: string | null
  subtitle: string | null
  link_url: string | null
  order_index: number | null
}

const banners = ref<Banner[]>([])
const activeIndex = ref(0)
const intervalId = ref<number | null>(null)

const hasMultipleBanners = computed(() => banners.value.length > 1)

const loadBanners = async () => {
  const { data } = await supabase
    .from('main_banners')
    .select('id,image_url,title,subtitle,link_url,order_index')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  banners.value = data ?? []
  activeIndex.value = 0
}

const nextBanner = () => {
  if (!banners.value.length) return
  activeIndex.value = (activeIndex.value + 1) % banners.value.length
}

const prevBanner = () => {
  if (!banners.value.length) return
  activeIndex.value = (activeIndex.value - 1 + banners.value.length) % banners.value.length
}

const goToBanner = (index: number) => {
  activeIndex.value = index
}

const startAutoSlide = () => {
  if (!hasMultipleBanners.value) return
  intervalId.value = window.setInterval(nextBanner, 5000)
}

const stopAutoSlide = () => {
  if (intervalId.value !== null) {
    window.clearInterval(intervalId.value)
    intervalId.value = null
  }
}

onMounted(async () => {
  await loadBanners()
  startAutoSlide()
})

onUnmounted(stopAutoSlide)
</script>

<style scoped>
.hero {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 20px;
  border: 1px solid var(--color-border);
}

.banner-section {
  position: relative;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
  border: 1px solid var(--color-border);
  margin-bottom: 2.5rem;
  background: var(--color-background-soft);
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}

.banner-track {
  display: flex;
  transition: transform 0.4s ease;
}

.banner-slide {
  min-width: 100%;
  position: relative;
  aspect-ratio: 16 / 6;
  background: #111827;
}

.banner-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  display: block;
}

.banner-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem;
  color: white;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0));
}

.banner-content h2 {
  font-size: 2.2rem;
  margin: 0;
}

.banner-subtitle {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.8rem;
  opacity: 0.8;
}

.banner-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(15, 23, 42, 0.6);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-nav.prev {
  left: 1rem;
}

.banner-nav.next {
  right: 1rem;
}

.banner-dots {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.dot.active {
  background: white;
}

.hero-content h1 {
  font-size: 2.6rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.7;
}

.subtitle {
  opacity: 0.8;
  font-size: 1.05rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.hero-card {
  background: var(--color-background);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.hero-card ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: grid;
  gap: 0.5rem;
}

.section {
  margin-top: 2.5rem;
}

.section h2 {
  font-size: 1.8rem;
  margin-bottom: 1.25rem;
}

.feature-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.feature-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.info-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.primary-button,
.ghost-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  border: 1px solid transparent;
  text-decoration: none;
  font-size: 0.95rem;
  cursor: pointer;
  background: transparent;
  color: inherit;
}

.primary-button {
  background: #667eea;
  color: white;
}

.ghost-button {
  border-color: var(--color-border);
}

@media (max-width: 720px) {
  .banner-slide {
    aspect-ratio: 16 / 9;
  }

  .banner-content {
    padding: 1.5rem;
  }

  .banner-content h2 {
    font-size: 1.6rem;
  }

  .hero {
    padding: 1.5rem;
  }

  .hero-content h1 {
    font-size: 2.1rem;
  }
}
</style>
