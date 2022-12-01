const { readUserInput } = require('../utils/readInput')

exports.createIntCodeComputer = function() {

  // -------- MATH
  const mathBinaryOp = (cmdSet, ra, binaryOp) => {
    const modes = getParamModes(cmdSet[0], 3)
    // if mode is true, use val, otherwise reference
    const val1 = modes[0] ? cmdSet[1] : ra.read( cmdSet[1] )
    const val2 = modes[1] ? cmdSet[2] : ra.read( cmdSet[2] )
    ra.write(cmdSet[3], binaryOp(val1, val2))
    return (idx) => idx + 4
  }

  const addHandler = (cmdSet, arr) => mathBinaryOp(cmdSet, arr, (v1, v2) => v1 + v2)

  const multiplyHandler = (cmdSet, arr) => mathBinaryOp(cmdSet, arr, (v1, v2) => v1 * v2)


  // -------- INPUT/OUTPUT
  const readUserInputHandler = async (cmdSet, ra) => {
    if (inputs) { // not null means overrides were provided
      let input = inputs.shift();
      if (input instanceof Promise) {
        input = await input;
      }
      ra.write(cmdSet[1], parseInt(input))
    } else {
      await readUserInput('Input required (num): ', (answer) => ra.write(cmdSet[1], parseInt(answer)))
    }

    return (idx) => idx + 2
  }

  const displayOutputHandler = (cmdSet, ra) => {
    const modes = getParamModes(cmdSet[0], 1)
    const val = modes[0] ? cmdSet[1] : ra.read( cmdSet[1] )
    if (!quietMode) console.log(val)
    outputs.push(val)
    return (idx) => idx + 2
  }


  // -------- JUMP
  const jumpIfOp = (cmdSet, ra, condition) => {
    const modes = getParamModes(cmdSet[0], 2)
    const test = modes[0] ? cmdSet[1] : ra.read( cmdSet[1] )
    const jump = modes[1] ? cmdSet[2] : ra.read( cmdSet[2] )
    return (condition ? test : !test)
        ? (idx) => jump
        : (idx) => idx + 3
  }

  const jumpIfTrueHandler = (cmdSet, ra) => jumpIfOp(cmdSet, ra, true)

  const jumpIfFalseHandler = (cmdSet, ra) => jumpIfOp(cmdSet, ra, false)


  // -------- COMPARISONS
  const comparisonOp = (cmdSet, ra, compareOp) => {
    const modes = getParamModes(cmdSet[0], 3)
    const val1 = modes[0] ? cmdSet[1] : ra.read( cmdSet[1] )
    const val2 = modes[1] ? cmdSet[2] : ra.read( cmdSet[2] )
    ra.write(cmdSet[3], compareOp(val1, val2) ? 1 : 0)
    return (idx) => idx + 4
  }

  const lessThanHandler = (cmdSet, ra) => comparisonOp(cmdSet, ra, (v1, v2) => v1 < v2)

  const equalityHandler = (cmdSet, ra) => comparisonOp(cmdSet, ra, (v1, v2) => v1 === v2)


  // -------- COMPUTER
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

  let inputs;
  let outputs = [];
  let quietMode = false;

  return {
    runProgram: async (intcodeProg, inputOverrides = null, quiet = false) => {

      inputs = inputOverrides;
      outputs = [];
      quietMode = quiet;

      const randomAccess = {
        read: (pos) => intcodeProg[pos],
        write: (pos, val) => { intcodeProg[pos] = val }
      }

      let idx = 0
      while (idx < intcodeProg.length) {
          const opcode = intcodeProg[idx] % 100
          
          if (opcode === 99) {
              if (!quietMode) console.log(`Program terminated successfully`)
              break;
          }
          
          const opdetail = operations[opcode]
          const parts = intcodeProg.slice(idx, idx + opdetail.inc)
          const instrPtrUpdate = opdetail.async ? await opdetail.func(parts, randomAccess) : opdetail.func(parts, randomAccess)
          idx = instrPtrUpdate(idx)
      }

      return {
        intcodeProg,
        outputs
      }
    }
  }
}
