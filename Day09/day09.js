const { createIntCodeComputerV3 } = require('./intCodeCompV3')
const { readFileInput } = require('../utils/readInput')

const intcodeProgOriginal = readFileInput('input', '\n', false)[0]
const intcodeProg = intcodeProgOriginal.split(',').map(n => parseInt(n))

console.log('-----DAY 9-----')

// Test Cases

//const intcodeProg = [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99]
//const intcodeProg = [1102,34915192,34915192,7,4,7,99,0]
//const intcodeProg = [104,1125899906842624,99]

function getComputer(intcodeProg) {
  const engine = createIntCodeComputerV3(intcodeProg);
  return {
    reset: () => engine.reset(),
    run: (initInput) => {
      let completed = false;
      let output;
      let loops = 0;
      while (!completed && loops < 20) {
        const result = engine.runSegment(loops === 0 ? initInput : [])
        completed = result.isCompleted;
        output = result.output;
        loops++
      }
      return output;
    }
  }
}

const computer = getComputer(intcodeProg);

// Part 1 - modify int code computer
computer.reset();
console.log(`Part 1: ${computer.run([1])}`)


// Part 2 - signal boosting
computer.reset();
console.log(`Part 2: ${computer.run([2])}`)