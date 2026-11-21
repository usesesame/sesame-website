export function digestsAsShown(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<wbr\s*\/?>|<\/?span\b[^>]*>/gi, '')
}
