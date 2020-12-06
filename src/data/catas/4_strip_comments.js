const code = `function solution(input, markers) {
  input = input.split('\n')
  for (let mark of markers){
    input.forEach( (el,index) =>{
      let pivot = el.indexOf(mark)
      input[index] =  el.substring(0, pivot !== -1 ? pivot : 999).trim()
    })
  }
  input = input.join('\n').trim()
  console.log(input)
  return input
}`

export default {
  lang: 'JS',
  name:'Strip Coments',
  q:4,
  code
}

