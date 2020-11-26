export default {

code:`
function permutations(string) {
    function permutation(array) {
        if (array.length > 1) {
            let firstElement = array[0]
            let returnedArray = permutation(array.slice(1))
            let permutedArray = []
            let temporaryArray = []
            let elementLength = returnedArray[0].length
            for (let i = 0; i < returnedArray.length; i++)
                for (let j = 0; j <= elementLength; j++) {
                    temporaryArray = returnedArray[i].slice(0)
                    temporaryArray.splice(j, 0, firstElement)
                    permutedArray.push(temporaryArray)
                }
            return permutedArray
        } else {
            return [array]
        }
    }
    let arr = string.split('')
    let answ = permutation(arr)
    answ = [...new Set(answ.map((el) => el.join('')))]
    return answ
}`
}

