const code = `function towerBuilder(nFloors) {
  let floor = ''.repeat(nFloors
  2 - 1
)
  let tower = []
  tower.push(floor)
  for (let i = 1; i  nFloors;
  i++
)
  {
    floor = floor.replace(, ' ').split('').reverse().join('').replace(, ' ')
    tower.push(floor)
  }
  return tower.reverse()
}`

export default {
  lang: 'JS',
  name: 'Build Tower',
  q   : 6,
  code
}