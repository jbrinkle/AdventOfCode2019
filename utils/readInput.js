const fs = require('fs')

exports.readInput = (filename, sep, parseNum) => {
    if (!fs.existsSync(filename)) {
        console.error('File not found: ' + filename)
        return null
    }
    
    const segments = fs.readFileSync(filename, 'utf-8')
        .split(sep)
        .filter(Boolean)
    return parseNum
        ? segments.map(s => {
            const n = parseInt(s)
            if (n === NaN) console.warn('Non numeric input found')
            return n })
        : segments
}