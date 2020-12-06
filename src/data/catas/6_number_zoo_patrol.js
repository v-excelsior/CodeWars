const code = `function findNumber(array) {
  const sum = (array.length + 1) * (array.length + 2) / 2
  const actualSun = array.reduce((acc,el) => acc + el, 0)
  
  return sum - actualSun
}`

export default {
  lang: 'JS',
  name: 'Number Zoo Patrol',
  q   : 6,
  code
}
