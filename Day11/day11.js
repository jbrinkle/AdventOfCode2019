const { readFileInput } = require('../utils/readInput')
const { createIntCodeComputerV3 } = require('../Day09/intCodeCompV3')

const paintCodeStr = readFileInput('input', '\n', false)[0];
const paintCode = paintCodeStr.split(',').map(n => parseInt(n));

console.log('-----DAY 11-----')

// grid state
class Grid {
  path = []
  paintedLocations = { } // pattern: x,y: color
  currentLoc = { x: 0, y: 0, color: 0, dir: 'U' }

  constructor(defaultPanelColor) {
    this.path = []
    this.paintedLocations = { '0,0': defaultPanelColor } // pattern: x,y: color
    this.currentLoc = { x: 0, y: 0, color: defaultPanelColor, dir: 'U' }
  }
  scanColor() {
    return this.paintedLocations[`${this.currentLoc.x},${this.currentLoc.y}`] ?? 0
  }
  paint(color) {
    this.currentLoc.color = color
  }
  turnLeft() {
    this._recordMove()
    switch(this.currentLoc.dir) {
      case 'U':
        this.currentLoc.dir = 'L'
        this.currentLoc.x--
        break;
      case 'L':
        this.currentLoc.dir = 'D'
        this.currentLoc.y--
        break;
      case 'D':
        this.currentLoc.dir = 'R'
        this.currentLoc.x++
        break;
      case 'R':
        this.currentLoc.dir = 'U'
        this.currentLoc.y++
        break;
    }
  }
  turnRight() {
    this._recordMove()
    switch(this.currentLoc.dir) {
      case 'U':
        this.currentLoc.dir = 'R'
        this.currentLoc.x++
        break;
      case 'R':
        this.currentLoc.dir = 'D'
        this.currentLoc.y--
        break;
      case 'D':
        this.currentLoc.dir = 'L'
        this.currentLoc.x--
        break;
      case 'L':
        this.currentLoc.dir = 'U'
        this.currentLoc.y++
        break;
    }
  }
  _recordMove() {
    this.path.push(this.currentLoc)
    this.paintedLocations[`${this.currentLoc.x},${this.currentLoc.y}`] = this.currentLoc.color

    const newLoc = { ...this.currentLoc }
    this.currentLoc = newLoc;
  }
}

// computer state
function run(startPanelColor) {
  const grid = new Grid(startPanelColor);

  const computer = createIntCodeComputerV3(paintCode);
  //const computer = createIntCodeComputerV3([3,0, 104,1,104,1, 104,1,104,0,104,0,104,1,104,0,104,1,104,1,104,0, 99], '      ');


  let cycles = 0;
  while (true) {
    //console.log(`CYCLE ${cycles}`);

    const input = [ grid.scanColor() ];
    //console.log(`  Scanned color ${input[0]} at `, grid.currentLoc)

    const colorToPaint = computer.runSegment(input);
    if (colorToPaint.isCompleted) break;
    grid.paint(colorToPaint.output);
    //console.log(`  Painted panel color ${colorToPaint.output}`)

    const dirChange = computer.runSegment()
    if (dirChange.isCompleted) break;
    if (dirChange.output > 0) {
      grid.turnRight();
      //console.log(`  Turned right. New location: `, grid.currentLoc)
    }
    else {
      grid.turnLeft();
      //console.log(`  Turned left. New location: `, grid.currentLoc)
    }

    cycles++;
  }

  return grid;
}

// PART 1 - painted panel count
const output1 = run(0);
console.log('Painted panels: ', Object.keys(output1.paintedLocations).length);

// PART 2 - letters
const output2 = run(1);

const { minX, maxX } = output2.path.reduce((minmax, pathStop) => {
  if (pathStop.x < minmax.minX) minmax.minX = pathStop.x
  if (pathStop.x > minmax.maxX) minmax.maxX = pathStop.x
  return minmax
}, { minX: 0, maxX: 0 })
const { minY, maxY } = output2.path.reduce((minmax, pathStop) => {
  if (pathStop.y < minmax.minY) minmax.minY = pathStop.y
  if (pathStop.y > minmax.maxY) minmax.maxY = pathStop.y
  return minmax
}, { minY: 0, maxY: 0 })

for (let row = maxY; row >= minY; row--) {
  let rowStr = '';
  for (let col = minX; col <= maxX; col++) {
    const color = output2.paintedLocations[`${col},${row}`]
    if (!color) rowStr += ' '
    else rowStr += '#'
  }
  console.log(rowStr);
}