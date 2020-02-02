import { slidePlugin } from './slides'

window.$docsify = window.$docsify || {}

window.$docsify.plugins = (window.$docsify.plugins || []).concat([slidePlugin])