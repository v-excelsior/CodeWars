const code = `function josephus(items,k){
  let answ = [],pos = 0
  while(items.length){
    for (let i = 1; i < k; i++){
    items.push(items.shift())
    }
    answ.push(items.shift())
  }
  return answ
}`

export default {
  lang: 'JS',
  name: 'Josephus permutation',
  q   : 5,
  code
}