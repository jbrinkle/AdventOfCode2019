const inputReader = require('../utils/readInput').readFileInput
const lines = inputReader('input', '\n', false)

console.log('-----DAY 3-----')

// Input and helper functions
const line1def = lines[0].split(',')
const line2def = lines[1].split(',')
// const line1def = ['R2','U25','L3','D23','L6','D6']
// const line2def = ['L9','U3','R13','D5','L5','D2']
// const line1def = ['R75','D30','R83','U83','L12','D49','R71','U7','L72']
// const line2def = ['U62','R66','U55','R34','D71','R55','D58','R83']
// const line1def = ['R98','U47','R26','D63','R33','U87','L62','D20','R33','U53','R51']
// const line2def = ['U98','R91','D20','R16','D67','R40','U7','R15','U6','R7']

const buildLineSegment = (relativePt, instruction, arr, doMoreStuff) => {
    const instrCode = instruction[0]
    const num = parseInt(instruction.substring(1))

    const isLR = instrCode === 'R' || instrCode === 'L'
    const isLD = instrCode === 'D' || instrCode === 'L'
    const segment = {
        isHorizontal: isLR,
        at: isLR ? relativePt.y : relativePt.x,
        dir: instrCode,
        from: (isLR ? relativePt.x : relativePt.y) - (isLD ? num : 0),
        to: (isLR ? relativePt.x : relativePt.y) + (!isLD ? num : 0),
        steps: num
    }
    arr.push(segment);

    if (doMoreStuff) {
        doMoreStuff(segment)
    }

    relativePt.y += (isLR ? 0 : isLD ? -num : num)
    relativePt.x += (isLR ? (isLD ? -num : num) : 0)
    return relativePt;
}
const getIntersection = (seg1, seg2) => {
    if (seg1.isHorizontal === seg2.isHorizontal) return undefined;

    if (seg1.at >= seg2.from && seg1.at <= seg2.to &&
        seg2.at >= seg1.from && seg2.at <= seg1.to) {
            const intersection = { 
                x: seg1.isHorizontal ? seg2.at : seg1.at,
                y: seg1.isHorizontal ? seg1.at : seg2.at
            }
            if (intersection.x === 0 && intersection.y === 0) return undefined
            return intersection
        }
}

// part 1 - Nearest Manhatten intersection to origin
const detectIntersection = (haystack, needle, listOfIntersections) => {
    haystack.forEach(segment => {
        const intersect = getIntersection(needle, segment)

        if (!intersect) return;
        intersect.dist = Math.abs(intersect.x) + Math.abs(intersect.y)
        listOfIntersections.push(intersect)
    })
}

let intersections = []
const line1segments = []
line1def.reduce((prev, curr) => buildLineSegment(prev, curr, line1segments, undefined), { x: 0, y: 0 });
let line2segments = []
line2def.reduce((prev, curr) => buildLineSegment(prev, curr, line2segments, needle => detectIntersection(line1segments, needle, intersections)), { x: 0, y: 0 });

const nearestIntersectionToOrigin = intersections.reduce((closest, next) => next.dist < closest.dist ? next : closest)

console.log('Nearest intersection: ', nearestIntersectionToOrigin)

// part 2 - Minimizing travel distance
const detectMinTravelIntersection = (currentDistance, haystack, needle, listOfIntersections) => {
    // console.log('----------------------')
    // console.log(`Needle: ${JSON.stringify(needle)}, curDistance=`, currentDistance)
    haystack.reduce((travelDist, segment) => {
        // console.log(`    Seg: ${JSON.stringify(segment)}, dist=`, travelDist)
        const intersect = getIntersection(needle, segment)
        if (intersect) {
            // A bit complicated...but basically just measuring from the correct end of a segment 
            // to the intersection for proper distance counting
            let coord = (segment.isHorizontal ? intersect.x : intersect.y)
            const line1dist = travelDist + ((segment.dir === 'U' || segment.dir === 'R')
                ? coord - segment.from
                : segment.to - coord)

            coord = (needle.isHorizontal ? intersect.x : intersect.y)
            const line2dist = currentDistance + ((needle.dir === 'U' || needle.dir === 'R')
                ? coord - needle.from
                : needle.to - coord)

            intersect.line1dist = line1dist
            intersect.line2dist = line2dist
            intersect.sumdist = line1dist + line2dist

            // console.log('    Intersection found!', intersect)
            listOfIntersections.push(intersect)
        }

        // as we move on to next segment, add this segment's length to distance traveled
        return travelDist + segment.steps;
    }, 0)

    // next needle needs this needle's distance from origin
    return currentDistance + needle.steps
}

intersections = []
line2segments = []
currentLine2travelDist = 0
line2def.reduce((prev, curr) => buildLineSegment(prev, curr, line2segments, needle => {
    currentLine2travelDist = detectMinTravelIntersection(currentLine2travelDist, line1segments, needle, intersections)
}), { x: 0, y: 0 });

const intersectionWithShortestTravel = intersections.reduce((closest, next) => next.sumdist < closest.sumdist ? next : closest)

console.log('Minimal travel distance: ', intersectionWithShortestTravel)