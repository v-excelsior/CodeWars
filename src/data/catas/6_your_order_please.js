const code =`
const order = w => w.split(' ').sort((a,b) => a.match(/\d+/) - b.match(/\d+/)).join(' ')
`

export default {
  lang: 'JS',
  name: 'Your order, please',
  q: 6,
  code
}