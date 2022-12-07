const { readFileInput } = require('../utils/readInput')

const asteroidMap = readFileInput('input', '\n', false)

// const asteroidMap = [
//   '.#..#',
//   '.....',
//   '#####',
//   '....#',
//   '...##'
// ]

// const asteroidMap = [
//   '##.',
//   '.#.',
//   '.##'
// ]

// const asteroidMap = [
//   '#.#...#.#.',
//   '.###....#.',
//   '.#....#...',
//   '##.#.#.#.#',
//   '....#.#.#.',
//   '.##..###.#',
//   '..#...##..',
//   '..##....##',
//   '......#...',
//   '.####.###.'
// ]

console.log('-----DAY 10-----')

function findFactors(num) {
  // find factors of "num"
  const factors = [];
  const max = num / 2;

  factors.push(1);
  for (let i = 2; i <= max; i++) {
    if (num % i === 0) {
      factors.push(i);
    }
  }
  factors.push(num);

  return factors;
}

function gcf(factorsA, factorsB) {
  // greatest common factor among list of factors of a and b
  for (let i = factorsA.length - 1; i >= 0; i--) {
    for (let j = factorsB.length - 1; j >= 0; j--) {
      if (factorsA[i] == factorsB[j]) return factorsA[i];
    }
  }
  return 1;
}

function findSlope(a, b) {
  // identify rise and run from a --> b
  // a(0,0) b(1,1) --> run=1  ris=1   (slope = 1 to lower right
  // a(0,2) b(1,1) --> run=1  ris=-1  (slope = -1 to upper right)
  // a(2,0) b(1,1) --> run=-1 ris=1   (slope = -1 to lower left)
  // a(2,2) b(1,1) --> run=-1 ris=-1  (slope = 1 to upper left)

  let rise = b.y - a.y;
  let run = b.x - a.x;

  if (rise !== 0 && run !== 0) {
    const factorsRise = findFactors(Math.abs(rise));
    const factorsRun = findFactors(Math.abs(run));
    const greatestCommonFactor = gcf(factorsRise, factorsRun);
  
    rise /= greatestCommonFactor;
    run /= greatestCommonFactor;
  } else {
    rise = rise > 0 ? 1 : (rise < 0 ? -1 : 0);
    run = run > 0 ? 1 : (run < 0 ? -1 : 0);
  }

  return {
    rise,
    run
  }
}

function isSameLocation(a, b) {
  return a.x === b.x && a.y === b.y;
}

function getMetaForComp(slope, blockages) {
  // generate metadata based on slope and blockage information
  // metadata is used later for sorting

  let quadrant, angle;

  if (slope.rise < 0 && slope.run >= 0) {
    // upper right quadrant
    quadrant = 1
    angle = Math.abs(slope.run / slope.rise)
  } else if (slope.rise >= 0 && slope.run > 0) {
    // lower right quadrant
    quadrant = 2
    angle = Math.abs(slope.rise / slope.run)
  } else if (slope.rise > 0 && slope.run <= 0) {
    // lower left quadrant
    quadrant = 3
    angle = Math.abs(slope.run / slope.rise)
  } else { // (slope.rise <= 0 && slope.run < 0)
    // upper left quadrant
    quadrant = 4
    angle = Math.abs(slope.rise / slope.run)
  }

  return {
    quadrant,
    angle,
    blockages
  }
}

// Part 1 - get best satellite location based on count of visible asteroids

// record locations of all asteroids in the map
const asteroidLocations = []
asteroidMap.forEach((row, idxY) => {
  row.split('').forEach((col, idxX) => {
    if (col === '#') {
      asteroidLocations.push( {x: idxX, y: idxY} )
    }
  })
})

let maxVisibleAsteroids = 0;
let maxLoc;
let locationMeta; // meta information used for part 2

asteroidLocations.forEach(loc => {
  // from every asterioid...
  let visibleAsteroids = 0;
  let relativeMeta = []

  asteroidLocations.forEach(compare => {
    if (isSameLocation(loc, compare)) return;

    // ...check every other asterioid to see if it's visible
    const locTracer = { ...loc };
    // find slope/direction from "loc" to "compare" in reduced form
    const slope = findSlope(loc, compare);

    let isPathBlocked = false;
    // follow slope/direction one step at a time until arriving at "compare"
    // check each step to see if path is blocked by another asteroid
    let blockages = 0;
    while (!isSameLocation(locTracer, compare)) {
      locTracer.x += slope.run;
      locTracer.y += slope.rise;
      if (asteroidMap[locTracer.y][locTracer.x] === '#' && !isSameLocation(locTracer, compare)) {
        isPathBlocked = true;
        blockages++;
      }
    }
    if (!isPathBlocked) {
      visibleAsteroids++;
    }

    // for part 2 - store meta information for asteroid to be
    // analyzed later if "loc" has best visibility of other asteroids over all
    const compMeta = getMetaForComp(slope, blockages);
    relativeMeta.push({ ...compMeta, ...compare });
  })

  if (visibleAsteroids > maxVisibleAsteroids) {
    maxVisibleAsteroids = visibleAsteroids;
    maxLoc = loc;
    locationMeta = relativeMeta;
  }
})

console.log('Part 1: ', maxLoc, ` --> ${maxVisibleAsteroids}`)


// Part 2 - sort list of asteroids by meta information to identify correct order for zapping asteroids
locationMeta.sort((a, b) => {
  if (a.blockages > b.blockages) return 1;
  if (a.blockages < b.blockages) return -1;
  if (a.quadrant > b.quadrant) return 1;
  if (a.quadrant < b.quadrant) return -1;
  if (a.angle > b.angle) return 1;
  if (a.angle < b.angle) return -1;
  return 0;
});

const asterioid200 = locationMeta[199];
console.log('Part 2: ', asterioid200.x * 100 + asterioid200.y);





