const code = `
function solution(list){
  let answ = []
  for (let i = 0; i < list.length; i++){
    let cur = list[i]
    let dop
    while( list[i] === (list[i+1] - 1)){
      i++
      dop = list[i]
    }
    console.log(cur)
    if((cur + 1) < dop) {
      answ.push(cur+ '-' +dop)
    } else {
      answ.push(cur)
      dop?answ.push(dop):''
    }
  }
  return answ.join(',')
}`

export default {
  lang: 'JS',
  name:'The Observed Pin',
  q: 4,
  code
}