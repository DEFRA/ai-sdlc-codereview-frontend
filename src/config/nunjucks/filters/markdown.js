import { marked } from 'marked'

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub flavored markdown
  breaks: true, // Convert line breaks to <br>
  headerIds: false, // Don't add IDs to headers (for security)
  mangle: false // Don't encode email addresses
})

/**
 * Convert markdown to HTML
 * @param {string} text - The markdown text to convert
 * @returns {string} The HTML output
 */
export function markdown(text) {
  if (!text) return ''
  return marked(text)
}
