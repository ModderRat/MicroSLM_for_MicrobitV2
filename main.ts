// MicroSLM — single-file MakeCode program for BBC micro:bit V2
// Paste this entire file into the MakeCode JavaScript editor.
//
// Serial commands (USB serial, newline terminated):
//   GEN the little robot       Generate text from a prompt
//   LEARN the little robot ... Add text to the model's training counts
//   RESET                       Reset to the built-in training corpus
//   HELP                        Show commands
//
// This is a compact character-level bigram statistical language model.
// It learns transition frequencies from text and samples the next character.
// It is not a neural network.

const ALPHABET = "abcdefghijklmnopqrstuvwxyz "
const VOCAB = 27
const MAX_OUTPUT = 120
const STARTER_TEXT =
    "the little robot is learning to speak. " +
    "the robot can read and write words. " +
    "once upon a time there was a tiny machine. " +
    "the machine learned from examples. " +
    "learning takes practice and patience. " +
    "the quick brown fox jumps over the lazy dog. " +
    "hello world. " +
    "the small model predicts the next character. " +
    "the curious mouse explored the forest. " +
    "it found a little house near the river. " +
    "the sun is shining and the birds are singing. " +
    "machines learn patterns from data. " +
    "the world is full of interesting things. "

// counts[previous character][next character]
let counts: number[] = []
let trainedCharacters = 0

function charIndex(ch: string): number {
    ch = ch.toLowerCase()
    let i = ALPHABET.indexOf(ch)
    if (i < 0) {
        return ALPHABET.indexOf(" ")
    }
    return i
}

function clearModel(): void {
    counts = []
    for (let i = 0; i < VOCAB * VOCAB; i++) {
        counts.push(0)
    }
    trainedCharacters = 0
}

function learn(text: string): void {
    text = text.toLowerCase()
    if (text.length < 2) {
        return
    }

    for (let i = 0; i < text.length - 1; i++) {
        let a = charIndex(text.charAt(i))
        let b = charIndex(text.charAt(i + 1))
        let index = a * VOCAB + b

        // Saturate counts to avoid integer overflow.
        if (counts[index] < 250) {
            counts[index] = counts[index] + 1
        }
        trainedCharacters++
    }
}

function trainStarterModel(): void {
    clearModel()
    learn(STARTER_TEXT)
}

function predictNext(previous: string): string {
    let row = charIndex(previous) * VOCAB
    let total = 0

    for (let i = 0; i < VOCAB; i++) {
        total += counts[row + i]
    }

    // If this context has not been seen, choose a random letter/space.
    if (total == 0) {
        return ALPHABET.charAt(Math.randomRange(0, VOCAB - 1))
    }

    let pick = Math.randomRange(1, total)
    for (let i = 0; i < VOCAB; i++) {
        pick -= counts[row + i]
        if (pick <= 0) {
            return ALPHABET.charAt(i)
        }
    }

    return " "
}

function generate(prompt: string, length: number): string {
    prompt = prompt.toLowerCase()
    if (prompt.length == 0) {
        prompt = "the "
    }

    let output = prompt
    let previous = prompt.charAt(prompt.length - 1)

    for (let i = 0; i < length; i++) {
        let next = predictNext(previous)
        output = output + next
        previous = next
    }
    return output
}

function showHelp(): void {
    serial.writeLine("")
    serial.writeLine("MicroSLM MakeCode")
    serial.writeLine("Commands:")
    serial.writeLine("GEN your prompt")
    serial.writeLine("LEARN text to learn")
    serial.writeLine("RESET")
    serial.writeLine("HELP")
    serial.writeLine("Vocabulary: lowercase a-z and space")
    serial.writeLine("")
}

function handleCommand(line: string): void {
    line = line.trim()
    if (line.length == 0) {
        return
    }

    if (line.toUpperCase() == "HELP") {
        showHelp()
    } else if (line.toUpperCase() == "RESET") {
        trainStarterModel()
        serial.writeLine("Model reset to starter corpus.")
    } else if (line.toUpperCase().substr(0, 6) == "LEARN ") {
        let text = line.substr(6)
        learn(text)
        serial.writeLine("Learned text. Training transitions: " + trainedCharacters)
    } else if (line.toUpperCase().substr(0, 4) == "GEN ") {
        let prompt = line.substr(4)
        serial.writeLine(generate(prompt, MAX_OUTPUT))
    } else {
        // Treat an unprefixed line as a generation prompt.
        serial.writeLine(generate(line, MAX_OUTPUT))
    }
}

basic.showIcon(IconNames.SmallDiamond)
serial.redirectToUSB()
serial.setBaudRate(BaudRate.BaudRate115200)

trainStarterModel()

serial.writeLine("")
serial.writeLine("MicroSLM ready — micro:bit V2")
serial.writeLine("Type HELP for commands.")
serial.writeLine("Starter transitions: " + trainedCharacters)

serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    handleCommand(line)
})

input.onButtonPressed(Button.A, function () {
    let result = generate("the ", 24)
    basic.showString(result)
})

input.onButtonPressed(Button.B, function () {
    basic.showNumber(trainedCharacters)
})
