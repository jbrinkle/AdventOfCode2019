exports.createIntCodeComputerV3 = function(codeRef) {

  // -------- MATH
  const mathBinaryOp = (cmdSet, ra, binaryOp) => {
    const modes = getParamModes(cmdSet[0], 3)
    // if mode is true, use val, otherwise reference
    const val1 = ra.read(cmdSet[1], modes[0])
    const val2 = ra.read(cmdSet[2], modes[1])
    ra.write(cmdSet[3], modes[2], binaryOp(val1, val2))
    return (idx) => idx + 4
  }

  const addHandler = (cmdSet, arr) => mathBinaryOp(cmdSet, arr, (v1, v2) => v1 + v2)

  const multiplyHandler = (cmdSet, arr) => mathBinaryOp(cmdSet, arr, (v1, v2) => v1 * v2)


  // -------- INPUT/OUTPUT
  const readInputHandler = (cmdSet, ra, input) => {
    const modes = getParamModes(cmdSet[0], 1)
    ra.write(cmdSet[1], modes[0], input)

    return (idx) => idx + 2
  }

  const writeOutputHandler = (cmdSet, ra, recordOutput) => {
    const modes = getParamModes(cmdSet[0], 1)
    const val = ra.read(cmdSet[1], modes[0])
    recordOutput(val);
    return (idx) => idx + 2
  }


  // -------- JUMP
  const jumpIfOp = (cmdSet, ra, condition) => {
    const modes = getParamModes(cmdSet[0], 2)
    const test = ra.read(cmdSet[1], modes[0])
    const jump = ra.read(cmdSet[2], modes[1])
    return (condition ? test : !test)
        ? (idx) => jump
        : (idx) => idx + 3
  }

  const jumpIfTrueHandler = (cmdSet, ra) => jumpIfOp(cmdSet, ra, true)

  const jumpIfFalseHandler = (cmdSet, ra) => jumpIfOp(cmdSet, ra, false)


  // -------- COMPARISONS
  const comparisonOp = (cmdSet, ra, compareOp) => {
    const modes = getParamModes(cmdSet[0], 3)
    const val1 = ra.read(cmdSet[1], modes[0])
    const val2 = ra.read(cmdSet[2], modes[1])
    ra.write(cmdSet[3], modes[2], compareOp(val1, val2) ? 1 : 0)
    return (idx) => idx + 4
  }

  const lessThanHandler = (cmdSet, ra) => comparisonOp(cmdSet, ra, (v1, v2) => v1 < v2)

  const equalityHandler = (cmdSet, ra) => comparisonOp(cmdSet, ra, (v1, v2) => v1 === v2)


  // -------- COMPUTER
  const adjRelBase = (cmdSet, ra) => {
    const modes = getParamModes(cmdSet[0], 1)
    const val1 = ra.read(cmdSet[1], modes[0])
    relativeBase += val1;
    return (idx) => idx + 2
  }

  const getParamModes = (opcode, count) => {
    const modes = []
    let modeDeclarations = Math.round(opcode / 100)
    while (count > 0) {
        modes.push(modeDeclarations % 10)
        modeDeclarations = Math.round(modeDeclarations / 10)
        count--
    }
    // console.log(`      opcode=${opcode} recognized modes ${modes}`)
    return modes
  }

  let relativeBase = 0;
  let isCompleted = false;
  let instrPtr = 0;
  let inputQueue = [];
  let lastOutput = undefined;
  let code = codeRef.slice();

  const randomAccess = {
    // mode 0 = abs addr; mode 1 = abs val; mode 2 = rel addr
    read: (pos, mode) => {
      if (mode === 0) return code[pos] ?? 0;
      if (mode === 1) return pos;
      if (mode === 2) {
        if (relativeBase + pos < 0) throw `Attempt to read neg address ${relativeBase + pos}`
        return code[relativeBase + pos] ?? 0;
      }
      throw `Invalid mode ${mode} when reading at pos = ${pos}`;
    },
    write: (pos, mode, val) => {
      if (mode === 0) {
        code[pos] = val
        return;
      }
      if (mode === 1) return;
      if (mode === 2) {
        if (relativeBase + pos < 0) throw `Attempt to write neg address ${relativeBase + pos}`
        code[relativeBase + pos] = val
        return;
      }
      throw `Invalid mode ${mode} when writing to pos = ${pos}`
    }
  }

  return {
    reset: function () {
      relativeBase = 0;
      isCompleted = false;
      instrPtr = 0;
      inputQueue = [];
      lastOutput = undefined;
      code = codeRef.slice();
    },
    // a segment of the code is any stretch of instructions that
    // does not terminate (instruction 99) or cause an output
    runSegment: function (newInputs) {
      if (newInputs) {
        //console.log(`      inputs: ${newInputs}`)
        if (Array.isArray(newInputs)) {
          newInputs.forEach(i => inputQueue.push(i));
        } else if (Number.isInteger(newInputs)) {
          inputQueue.push(newInputs);
        }
      }

      let outputPending = false;
      while (!outputPending && !isCompleted) {
        const opCode = code[instrPtr] % 100;
        let instrPtrUpdater;
        //console.log(`${opCode} --> ${code.toString()}`)

        switch (opCode) {
          case undefined:
          case 99:
            isCompleted = true;
            instrPtrUpdater = (idx) => idx
            break;
          case 1:
            instrPtrUpdater = addHandler(code.slice(instrPtr, instrPtr + 4), randomAccess);
            break;
          case 2:
            instrPtrUpdater = multiplyHandler(code.slice(instrPtr, instrPtr + 4), randomAccess);
            break;
          case 3:
            const input = inputQueue.shift();
            instrPtrUpdater = readInputHandler(code.slice(instrPtr, instrPtr + 2), randomAccess, input);
            break;
          case 4:
            instrPtrUpdater = writeOutputHandler(code.slice(instrPtr, instrPtr + 2), randomAccess, o => lastOutput = o);
            outputPending = true;
            break;
          case 5:
            instrPtrUpdater = jumpIfTrueHandler(code.slice(instrPtr, instrPtr + 3), randomAccess);
            break;
          case 6:
            instrPtrUpdater = jumpIfFalseHandler(code.slice(instrPtr, instrPtr + 3), randomAccess);
            break;
          case 7:
            instrPtrUpdater = lessThanHandler(code.slice(instrPtr, instrPtr + 4), randomAccess);
            break;
          case 8:
            instrPtrUpdater = equalityHandler(code.slice(instrPtr, instrPtr + 4), randomAccess);
            break;
          case 9:
            instrPtrUpdater = adjRelBase(code.slice(instrPtr, instrPtr + 2), randomAccess);
            break;
          default:
            throw `Catastrophic failure: received command ${opCode}`
        }

        instrPtr = instrPtrUpdater(instrPtr);
      }

      return {
        // for debug
        remainingInputs: inputQueue,
        instrPtr,
        // required outputs
        output: lastOutput,
        isCompleted
      }
    }
  }
}


/**
 * Example usage
 * 
 * const engine = createIntCodeComputerV2(intcode);
 * let completed = false;
 * while (!completed) {
 *   const result = engine.runSegment(input)
 * }
 */
