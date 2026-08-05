import sharpService from 'astro/assets/services/sharp'

const service = {
  ...sharpService,
  validateOptions(options, imageConfig) {
    const result = sharpService.validateOptions(options, imageConfig)
    if (options.format === 'webp') {
      options.format = 'avif'
    }
    return result
  },
}

export default service
