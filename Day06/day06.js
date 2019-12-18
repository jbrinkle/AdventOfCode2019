const { readFileInput, readUserInput } = require('../utils/readInput')
const orbitData = readFileInput('input', '\n', false)
// const orbitData = 'COM)B,B)C,C)D,D)E,E)F,B)G,G)H,D)I,E)J,J)K,K)L,K)YOU,I)SAN'.split(',')

console.log('-----DAY 6-----')

function newObjectInSpace() { return { orbits: null, orbitedBy: [] }; }

const objects = new Map()
orbitData.forEach(orbitEntry => {
    const data = orbitEntry.split(')')
    const nameOfOrbited = data[0]
    const nameOfOrbitor = data[1]

    let obj;
    // orbited
    if (objects.has(nameOfOrbited)) {
        obj = objects.get(nameOfOrbited)
    } else {
        obj = newObjectInSpace()
        objects.set(nameOfOrbited, obj)
    }
    obj.orbitedBy.push(nameOfOrbitor)

    // orbitor
    if (objects.has(nameOfOrbitor)) {
        obj = objects.get(nameOfOrbitor)
    } else {
        obj = newObjectInSpace()
        objects.set(nameOfOrbitor, obj)
    }
    obj.orbits = nameOfOrbited
})

// --- PART 1: Count total orbits

let count = 0
const queue = [ { obj: objects.get('COM'), level: 0 } ]
while (queue.length) {
    const pop = queue.pop()
    count += pop.level
    pop.obj.orbitedBy.forEach(o => {
        queue.push({
            obj: objects.get(o),
            level: pop.level + 1
        })
    })
}

console.log(`Total orbits (direct and indirect): ${count}`)

// --- PART 2: Count jumps from YOU to SAN

const myPathToCOM = []
const myOrigin = objects.get('YOU').orbits
const destLocation = objects.get('SAN').orbits

if (myOrigin === destLocation) {
    console.log('Orbital transfers required: 0')
    return
}

// map a path back to COM from current location
let jump = objects.get(myOrigin)
while (jump.orbits !== null) {
    myPathToCOM.push(jump.orbits)
    jump = objects.get(jump.orbits)
}
// now find a common stop from SAN
jump = objects.get(destLocation)
let idxInMyPath = -1
const sanPathToIntersect = [ destLocation ]
while (jump.orbits !== null) {
    sanPathToIntersect.unshift(jump.orbits)
    idxInMyPath = myPathToCOM.indexOf(jump.orbits)
    if (idxInMyPath > -1) {
        break;
    }
    jump = objects.get(jump.orbits)
}
// create route
const route = myPathToCOM.slice(0,idxInMyPath).concat(sanPathToIntersect)
console.log(`Orbital transfers required: ${route.length}`)