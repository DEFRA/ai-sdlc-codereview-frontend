/**
 * @type {Config}
 */
export default {
  extends: ['stylelint-config-gds/scss'],
  ignoreFiles: [
    '**/public/**',
    '**/package/**',
    '**/vendor/**',
    '**/playwright-report/**',
    '**/test-results/**'
  ]
}

/**
 * @import { Config } from 'stylelint'
 */
