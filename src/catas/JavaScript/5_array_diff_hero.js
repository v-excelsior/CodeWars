export default {
  lang: 'JS',
  name: '',
  q   : 5,
  code
}

const code = `
function array_diff_very_fast(a, b) {
  b = new Set(b)
  return a.filter( el = !b.has(el))
}`