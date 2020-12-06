const code = `
const nums = [
  '     |  |',
  ' _  _||_ ',
  ' _  _| _|',
  '   |_|  |',
  ' _ |_  _|',
  ' _ |_ |_|',
  ' _   |  |',
  ' _ |_||_|',
  ' _ |_| _|'
]

function parseBankAccount(bankAccount) {
    let answ = []
    let rows = bankAccount.split('\n')
    let lg = rows[0].length / 3
    for (let i = 0; i < lg; i++){
    let number = rows[0].slice(0,3) + rows[1].slice(0,3) + rows[2].slice(0,3)
    for (let y = 0; y < 3; y++){
      rows[y] = rows[y].slice(3)
    }
    answ.push(nums.indexOf(number)+1)
  }
  return parseInt(answ.join(''))
}`

export default {
  lang: 'JS',
  name: 'Parse bank account number',
  q   : 6,
  code
}