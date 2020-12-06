const code = `
function duplicateEncode(word){
   word = word.toLowerCase()
   let answ = []
   for (let el of word){
     if (word.split('').filter(symb => symb == el).length > 1){
       answ.push(')')
     } else {
       answ.push('(')
     }
   }
   return answ.join('')
}`

export default {
  lang: 'JS',
  name: 'Duplicate encoder',
  q   : 6,
  code
}