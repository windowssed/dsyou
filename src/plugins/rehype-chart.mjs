import { visit } from 'unist-util-visit'

const CHART_LANG_RE = /^language-chart(?:\s*|$)/

/**
 * rehype-chart
 *
 * 把 `` ```chart `` 代码块（内容是 ECharts option JSON）转换为：
 *   <div class="chart-block" data-chart="<json-escaped>">
 *
 * 页面端的 ECharts 渲染逻辑见 src/lib/charts.ts（由文章页脚本按需加载）。
 */
export function rehypeChart() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre') return

      const codeEl = node.children?.find(
        (child) => child.type === 'element' && child.tagName === 'code'
      )
      if (!codeEl) return

      const classes = codeEl.properties?.className
      const isChart =
        Array.isArray(classes) &&
        classes.some((c) => typeof c === 'string' && CHART_LANG_RE.test(c))

      if (!isChart) return

      const raw = (codeEl.children ?? [])
        .map((child) => (child.type === 'text' ? child.value : ''))
        .join('')
        .trim()

      if (!raw) return

      let option
      try {
        option = JSON.parse(raw)
      } catch (e) {
        console.warn(
          `[rehype-chart] 无法解析图表 JSON，已跳过该代码块: ${e.message}`
        )
        return
      }

      const divNode = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['chart-block'],
          dataChart: JSON.stringify(option),
        },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['chart-canvas'] },
            children: [],
          },
        ],
      }

      parent.children[index] = divNode
    })
  }
}
