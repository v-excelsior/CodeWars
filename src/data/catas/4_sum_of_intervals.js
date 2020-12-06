const code = `function sumIntervals(intervals){
  intervals.sort((i1,i2) => i1[0] - i2[0])
  for(let i = 1; i < intervals.length;){
    if(intervals[i][1] <= intervals[i-1][1]){
      intervals.splice(i,1)
      continue
    }
    if(intervals[i][0] < intervals[i-1][1]){
      intervals[i-1][1] = intervals[i][1]
      intervals.splice(i,1)
    }
    i++
  }
  return intervals.reduce((acc,el) => acc += el[1] - el[0],0)
}`

export default {
    lang:'JS',
    name: 'Sum of Intervals',
    q: 4,
    code
}