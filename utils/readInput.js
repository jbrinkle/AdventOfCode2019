const fs = require('fs')
const { createInterface } = require('readline')
const { once } = require('events')

exports.readFileInput = (filename, sep, parseNum) => {
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

exports.readUserInput = async (prompt, userInputHandler) => {
    const io = createInterface({ input: process.stdin, output: process.stdout })

    process.stdout.write(prompt)

    io.on('line', (answer) => {
        userInputHandler(answer)
        io.close()
    });
    
    await once(io, 'close')
}