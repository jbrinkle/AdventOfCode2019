const { createIntCodeComputer } = require('../Day05/intCodeComp')
const { readFileInput } = require('../utils/readInput')
const { createIntCodeComputerV2 } = require('./intCodeCompV2')

console.log('-----DAY 7-----')

// initialization
let ampArr = [];
for (let i = 0; i < 5; i++) {
  ampArr.push(createIntCodeComputer())
}

const intcodeProgOriginal = readFileInput('input', '\n', false)[0]
const intcodeProg = intcodeProgOriginal.split(',').map(n => parseInt(n))
// Part 1 tests
// [3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0]
// [3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0]
// [3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0]
// Part 2 tests
// [3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5]
// [3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10]

// PART 1 - Test output of an amp array configuration
let maxOutput = 0;

async function runTest1(phaseConfig) {
  // console.log(phaseConfig);
  
  let lastOutput = 0;
  for (let idx = 0; idx < ampArr.length; idx++) {
    // run the amp
    const phase = phaseConfig[idx];
    const { outputs } = await ampArr[idx].runProgram(intcodeProg, [phase, lastOutput], true);
    lastOutput = outputs[0];
    // logging
    // console.log(`  ${idx}(${phase}) -> ${lastOutput}`)
  }
  
  if (lastOutput > maxOutput) maxOutput = lastOutput;
}

// iterate through various combinations of phase selections
async function selectPhases(remaining, selected = []) {
  if (remaining.length === 0) {
    // Base case: full phase config established, run test
    await runTest1(selected)
    return;
  }
  
  for (let p = 0; p < remaining.length; p++) {
    const selection = remaining.splice(p, 1)[0];
    await selectPhases(remaining, selected.concat(selection))
    remaining.splice(p, 0, selection)
  }
}

selectPhases([0,1,2,3,4]).then(() => {
  console.log('---------')
  console.log(`MAX: ${maxOutput}`)
})


// console.log('-----Part 2-----')

// ampArr = [];
// maxOutput = 0;

// for (let i = 0; i < 5; i++) {
//   ampArr.push(createIntCodeComputerV2(intcodeProg))
// }

// function runTest2(phaseConfig) {
//   ampArr.forEach(amp => amp.reset())

//   let isCompleted = false;
//   let loops = 0;
//   let outputToInput = 0;
//   while (!isCompleted) {
//     if (loops > 60) throw 'Inf loop in perm: ' + phaseConfig.toString();
//     ampArr.forEach((amp, idx) => {
//       //console.log(`    Amp-${idx}`)
//       const result = amp.runSegment(
//           (loops === 0 ? [ phaseConfig[idx] ] : [])
//             .concat(outputToInput)
//         );
//       //console.log(`      R:`, result)
//       outputToInput = result.output;
//       isCompleted |= result.isCompleted;
//     })
//     // const resultA = ampArr[0].runSegment( (loops === 0 ? [ phaseConfig[0], 0 ] : [ outputToInput ]))
//     // const resultB = ampArr[1].runSegment( (loops === 0 ? [ phaseConfig[1], resultA.output ] : [ resultA.output ]))
//     // const resultC = ampArr[2].runSegment( (loops === 0 ? [ phaseConfig[2], resultB.output ] : [ resultB.output ]))
//     // const resultD = ampArr[3].runSegment( (loops === 0 ? [ phaseConfig[3], resultC.output ] : [ resultC.output ]))
//     // const resultE = ampArr[4].runSegment( (loops === 0 ? [ phaseConfig[4], resultD.output ] : [ resultD.output ]))
//     // outputToInput = resultE.output;
//     // isCompleted = resultE.isCompleted;
//     // console.log(`Loop ${loops} --> ${outputToInput}`)
//     loops++;
//   }

//   if (outputToInput > maxOutput) maxOutput = outputToInput;
// }

// function buildPhasePermutations(remaining, selected = []) {
//   if (remaining.length === 0) {
//     console.log(`Permutation: ${selected}`)
//     runTest2(selected)
//     return;
//   }
//   for (let p = 0; p < remaining.length; p++) {
//     const selection = remaining.splice(p, 1)[0];
//     buildPhasePermutations(remaining, selected.concat(selection))
//     remaining.splice(p, 0, selection)
//   }
// }

// buildPhasePermutations([5,6,7,8,9]);
// //runTest2([5,6,7,9,8])
// console.log('---------')
// console.log(`MAX: ${maxOutput}`)
