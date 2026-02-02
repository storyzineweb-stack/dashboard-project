<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}

interface Props {
  data: ChartData
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (canvasRef.value) {
    drawChart()
  }
})

function drawChart() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // 배경 초기화
  ctx.clearRect(0, 0, width, height)

  // 최대값 계산
  const allData = props.data.datasets.flatMap((d) => d.data)
  const maxValue = Math.max(...allData)
  const minValue = Math.min(...allData)
  const valueRange = maxValue - minValue || 1

  // 그리드 라인 그리기
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()

    // Y축 레이블
    const value = maxValue - (valueRange / 5) * i
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(Math.round(value).toString(), padding - 10, y + 4)
  }

  // 데이터셋 색상
  const colors: string[] = ['#667eea', '#f59e0b']

  // 라인 차트 그리기
  props.data.datasets.forEach((dataset, datasetIndex) => {
    const color = colors[datasetIndex % colors.length] ?? '#667eea'
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()

    dataset.data.forEach((value, i) => {
      const x = padding + (chartWidth / (dataset.data.length - 1)) * i
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // 데이터 포인트
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.stroke()
  })

  // X축 레이블
  ctx.fillStyle = '#6b7280'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  props.data.labels.forEach((label, i) => {
    const x = padding + (chartWidth / (props.data.labels.length - 1)) * i
    ctx.fillText(label, x, height - padding + 20)
  })
}
</script>

<template>
  <div class="chart-card">
    <h2>실적 추이</h2>
    <div class="chart-container">
      <canvas ref="canvasRef" width="600" height="300"></canvas>
    </div>
    <div class="chart-legend">
      <div
        v-for="(dataset, index) in data.datasets"
        :key="index"
        class="legend-item"
      >
        <span
          class="legend-color"
          :style="{ background: index === 0 ? '#667eea' : '#f59e0b' }"
        ></span>
        <span>{{ dataset.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h2 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.chart-container {
  width: 100%;
  overflow-x: auto;
}

canvas {
  max-width: 100%;
  height: auto;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
</style>
