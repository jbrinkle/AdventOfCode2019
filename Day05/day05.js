const { readFileInput, readUserInput } = require('../utils/readInput')
const intcodeProgOriginal = readFileInput('input', '\n', false)[0]

const startProg = async () => {
    await readUserInput('Prompt', (response) => console.log(response))
}
// Test programs: (day2 input for back compat check, example programs in day 5 description)
// const intcodeProg = '1,12,2,3,1,1,2,3,1,3,4,3,1,5,0,3,2,1,6,19,1,5,19,23,1,23,6,27,1,5,27,31,1,31,6,35,1,9,35,39,2,10,39,43,1,43,6,47,2,6,47,51,1,5,51,55,1,55,13,59,1,59,10,63,2,10,63,67,1,9,67,71,2,6,71,75,1,5,75,79,2,79,13,83,1,83,5,87,1,87,9,91,1,5,91,95,1,5,95,99,1,99,13,103,1,10,103,107,1,107,9,111,1,6,111,115,2,115,13,119,1,10,119,123,2,123,6,127,1,5,127,131,1,5,131,135,1,135,6,139,2,139,10,143,2,143,9,147,1,147,6,151,1,151,13,155,2,155,9,159,1,6,159,163,1,5,163,167,1,5,167,171,1,10,171,175,1,13,175,179,1,179,2,183,1,9,183,0,99,2,14,0,0'.split(',').map(n => parseInt(n))
// const intcodeProg = '3,0,4,0,99'.split(',').map(n => parseInt(n))
// const intcodeProg = '3,11,1006,11,8,104,0,99,104,1,99,0'.split(',').map(n => parseInt(n))
// const intcodeProg = '3,12,1007,12,8,12,4,12,99,0,0,0,0'.split(',').map(n => parseInt(n))
const intcodeProg = intcodeProgOriginal.split(',').map(n => parseInt(n))

console.log('-----DAY 5-----')

/* Parse parameter modes and return array of modes (true = immediate/value mode) */
const getParamModes = (opcode, count) => {
    const modes = []
    let modeDeclarations = Math.round(opcode / 100)
    while (count > 0) {
        modes.push(modeDeclarations % 10 === 1)
        modeDeclarations = Math.round(modeDeclarations / 10)
        count--
    }
    return modes
}

const mathBinaryOp = (cmdSet, arr, binaryOp) => {
    const modes = getParamModes(cmdSet[0], 3)
    // if mode is true, use val, otherwise reference
    const val1 = modes[0] ? cmdSet[1] : arr[ cmdSet[1] ]
    const val2 = modes[1] ? cmdSet[2] : arr[ cmdSet[2] ]
    arr[ cmdSet[3] ] = binaryOp(val1, val2)
    return (idx) => idx + 4
}

const addHandler = (cmdSet, arr) => mathBinaryOp(cmdSet, arr, (v1, v2) => v1 + v2)

const multiplyHandler = (cmdSet, arr) => mathBinaryOp(cmdSet, arr, (v1, v2) => v1 * v2)

const readUserInputHandler = async (cmdSet, arr) => {
    await readUserInput('Input required (num): ', (answer) => arr[ cmdSet[1] ] = parseInt(answer))
    return (idx) => idx + 2
}

const displayOutputHandler = (cmdSet, arr) => {
    const modes = getParamModes(cmdSet[0], 1)
    const val = modes[0] ? cmdSet[1] : arr[ cmdSet[1] ]
    console.log(val)
    return (idx) => idx + 2
}

const jumpIfOp = (cmdSet, arr, condition) => {
    const modes = getParamModes(cmdSet[0], 2)
    const test = modes[0] ? cmdSet[1] : arr[ cmdSet[1] ]
    const jump = modes[1] ? cmdSet[2] : arr[ cmdSet[2] ]
    return (condition ? test : !test)
        ? (idx) => jump
        : (idx) => idx + 3
}

const jumpIfTrueHandler = (cmdSet, arr) => jumpIfOp(cmdSet, arr, true)

const jumpIfFalseHandler = (cmdSet, arr) => jumpIfOp(cmdSet, arr, false)

const comparisonOp = (cmdSet, arr, compareOp) => {
    const modes = getParamModes(cmdSet[0], 3)
    const val1 = modes[0] ? cmdSet[1] : arr[ cmdSet[1] ]
    const val2 = modes[1] ? cmdSet[2] : arr[ cmdSet[2] ]
    arr[ cmdSet[3] ] = compareOp(val1, val2) ? 1 : 0
    return (idx) => idx + 4
}

const lessThanHandler = (cmdSet, arr) => comparisonOp(cmdSet, arr, (v1, v2) => v1 < v2)

const equalityHandler = (cmdSet, arr) => comparisonOp(cmdSet, arr, (v1, v2) => v1 === v2)

const operations = {
    1: { func: addHandler, inc: 4, async: false },
    2: { func: multiplyHandler, inc: 4, async: false },
    3: { func: readUserInputHandler, inc: 2, async: true },
    4: { func: displayOutputHandler, inc: 2, async: false },
    5: { func: jumpIfTrueHandler, inc: 3, async: false },
    6: { func: jumpIfFalseHandler, inc: 3, async: false },
    7: { func: lessThanHandler, inc: 4, async: false },
    8: { func: equalityHandler, inc: 4, async: false }
}

// Part 1 - Find the number of possible passwords given criteria
const runProgram = async () => {
    let idx = 0
    while (idx < intcodeProg.length) {
        const opcode = intcodeProg[idx] % 100
        
        if (opcode === 99) {
            console.log(`Program terminated successfully`)
            break;
        }
        
        const opdetail = operations[opcode]
        const parts = intcodeProg.slice(idx, idx + opdetail.inc)
        const instrPtrUpdate = opdetail.async ? await opdetail.func(parts, intcodeProg) : opdetail.func(parts, intcodeProg)
        idx = instrPtrUpdate(idx)
    }
}

runProgram()