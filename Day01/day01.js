console.log('-----DAY 1-----')

const inputReader = require('../utils/readInput').readFileInput
const modMassList = inputReader('input', '\n', true)

// part 1 - fuel required for mass
const fuelCalcAcc = (acc, mass) => acc + (Math.floor(mass / 3) - 2)

console.log('Fuel required for mass: ' + modMassList.reduce(fuelCalcAcc, 0));

// part 2 - fuel required with consideration for mass of fuel
const fuelCalcAcc2 = (acc, mass) => {
    const fuelForMass = Math.floor(mass / 3) - 2;

    if (mass <= 6) return acc;
    else return fuelCalcAcc2(acc + fuelForMass, fuelForMass);
}

console.log('Fuel required when compensating for weight of fuel: ' + modMassList.reduce(fuelCalcAcc2, 0))