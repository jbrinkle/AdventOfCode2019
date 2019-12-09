const inputReader = require('../utils/readInput').readInput
const intcodeProgBase = inputReader('input', ',', true)


console.log('-----DAY 2-----')
// part 1 - IntCode computer
// const intcodeProg = [1,9,10,3,2,3,11,0,99,30,40,50] // practice
let intcodeProg = intcodeProgBase.slice(0)

let iter = 0
let verbose = false
const commands = {
    1: () => {
        const pos1 = intcodeProg[iter + 1]
        const pos2 = intcodeProg[iter + 2]
        const pos3 = intcodeProg[iter + 3]
        const val1 = intcodeProg[pos1]
        const val2 = intcodeProg[pos2]
        intcodeProg[pos3] = val1 + val2
        if (verbose) console.log(`pos${pos1} (${val1}) + pos${pos2} (${val2}) => pos${pos3} (${val1 + val2})`)
        return iter + 4
    },
    2: () => {
        const pos1 = intcodeProg[iter + 1]
        const pos2 = intcodeProg[iter + 2]
        const pos3 = intcodeProg[iter + 3]
        const val1 = intcodeProg[pos1]
        const val2 = intcodeProg[pos2]
        intcodeProg[pos3] = val1 * val2
        if (verbose) console.log(`pos${pos1} (${val1}) x pos${pos2} (${val2}) => pos${pos3} (${val1 * val2})`)
        return iter + 4
    },
    99: () => {
        if (verbose) console.log(`Program end at pos ${iter}`)
        return -1
    }
}
const runProg = () => {
    while (iter >= 0) {
        const cmdcode = intcodeProg[iter];
        iter = commands[cmdcode]()
    }

    if (verbose) {
        if (intcodeProg.length <= 12) console.log(intcodeProg)
        else console.log(intcodeProg[0])
    }
}

// reset per instructions
intcodeProg[1] = 12
intcodeProg[2] = 2
// run program
runProg()

console.log(`Position zero value: ${intcodeProg[0]}`)

// part 2 - find the reset values that produce a certain number
const successCriteria = 19690720
let found = false

for (let noun = 0; noun <= 99 && !found; noun++)
for (let verb = 0; verb <= 99 && !found; verb++) {
    iter = 0
    intcodeProg = intcodeProgBase.slice(0)
    intcodeProg[1] = noun
    intcodeProg[2] = verb

    runProg();

    if (intcodeProg[0] == successCriteria) {
        console.log(`noun=${noun} verb=${verb} ==> ${noun}${verb}`)
        found = true
    }
}