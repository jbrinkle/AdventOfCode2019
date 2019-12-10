console.log('-----DAY 4-----')

// Part 1 - Find the number of possible passwords given criteria
const min = 240298
const max = 784956

const validateNumber = (num, constrainDoubleRule = false) => {
    let foundDecreaseDigit = false
    let foundDouble = false
    let repeat = 0
    
    const numStr = num.toString() // 177789
    for (let i = 1; i < numStr.length; i++) {
        foundDecreaseDigit = numStr[i] < numStr[i - 1]

        if (numStr[i] === numStr[i - 1]) { 
            repeat++
            foundDouble = foundDouble || !constrainDoubleRule || (i === 5 && repeat === 1)
        } else if (repeat > 0) {
            foundDouble = foundDouble || (constrainDoubleRule && repeat === 1)
            repeat = 0
        }
    
        if (foundDecreaseDigit) break
    }
    
    return { foundDecreaseDigit, foundDouble }
}

const getNewMin = (min) => {
    let minStr = min.toString()
    for (let i = 1; i < minStr.length; i++) {
        if (minStr[i] < minStr[i - 1] || parseInt(minStr) > min) {
            minStr = minStr.substr(0, i) + minStr[i - 1] + minStr.substr(i + 1)
        }
    }
    return parseInt(minStr)
}

let possiblePasswords = []
let curr = getNewMin(min)
while (curr < max) {
    const validation = validateNumber(curr)
    
    if (validation.foundDecreaseDigit) {
        curr = getNewMin(curr)
        continue
    }

    if (validation.foundDouble) possiblePasswords.push(curr)

    curr++
}

console.log(possiblePasswords.length)

// Part 2 - Restrict doubles

possiblePasswords = []
curr = getNewMin(min)
while (curr < max) {
    const validation = validateNumber(curr, true)

    if (validation.foundDecreaseDigit) {
        curr = getNewMin(curr)
        continue
    }

    if (validation.foundDouble) possiblePasswords.push(curr)

    curr++
}

console.log(possiblePasswords.length)



// TESTS
// console.log(validateNumber(112233, true))
// console.log(validateNumber(123777, true))
// console.log(validateNumber(111122, true))
// console.log(validateNumber(177789, true))
// console.log(validateNumber(112222, true))
// console.log(validateNumber(111222, true))


