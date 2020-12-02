function splitAndAdd(arr, n) {
  for ( let i = 0; i < n; i++){
  let pivot = Math.floor(arr.length) / 2
  let arr1 = arr.slice(0,pivot).reverse()
  let arr2 = arr.slice(pivot).reverse()
  arr2 = arr2.map((el,index) => el = el + (arr1[index] ?arr1[index] : 0))
  arr = arr2.reverse()
  }
  return arr
}