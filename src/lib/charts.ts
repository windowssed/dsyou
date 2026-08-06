import * as echarts from 'echarts/core'
import {
  BarChart,
  CandlestickChart,
  LineChart,
  PieChart,
  ScatterChart,
} from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  CandlestickChart,
  LineChart,
  PieChart,
  ScatterChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  CanvasRenderer,
])

/**
 * 渲染页面内所有 `.chart-block[data-chart]` 图表。
 * 返回一个清理函数（销毁实例并解除 resize 监听），供页面切换时调用。
 */
export function renderAllCharts(): () => void {
  const blocks = Array.from(
    document.querySelectorAll<HTMLElement>('.chart-block[data-chart]')
  )
  const instances: echarts.ECharts[] = []
  const observers: ResizeObserver[] = []

  for (const block of blocks) {
    const raw = block.dataset.chart
    if (!raw) continue

    let option: Record<string, unknown>
    try {
      option = JSON.parse(raw) as Record<string, unknown>
    } catch {
      console.warn('[charts] 图表配置 JSON 解析失败，已跳过。')
      continue
    }

    const canvas = block.querySelector<HTMLElement>('.chart-canvas')
    if (!canvas) continue

    const chart = echarts.init(canvas)
    chart.setOption(option)
    instances.push(chart)

    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(canvas)
    observers.push(observer)
  }

  return () => {
    observers.forEach((observer) => observer.disconnect())
    instances.forEach((chart) => chart.dispose())
  }
}
