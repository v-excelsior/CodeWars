const code = `
function songDecoder(song){
  return song.split('WUB').filter(el => el !== '').join(' ')
}`

export default {
  name: 'Make a spiral',
  q   : 3,
  code
}



