const code = `const uniqueInOrder = function(iterable){
  if (!iterable.length) return []
  if (!Array.isArray(iterable)) iterable = iterable.split('')
  let answ = []
  answ.push(iterable[0])
  for (let i = 1; i< iterable.length; i++) {
    if (iterable[i] != iterable[i-1]) answ.push(iterable[i])
  }
  return answ
}`

export default {
  lang: 'JS',
  name: 'Unique In Order',
  q   : 6,
  code
}