let i: number;
//  ============================================================
//  MicroSLM 1.0
//  Small Language Model
//  Microsoft MakeCode Python
//  BBC micro:bit V2
//  ============================================================
let ALPHABET = "abcdefghijklmnopqrstuvwxyz .,!?'-"
let VOCAB = ALPHABET.length
let CONTEXTS = 64
let MAX_COUNT = 250
let GEN_LENGTH = 80
let STARTER_TEXT = "hello there. the little robot is learning to talk. it reads text and predicts what character comes next. a small language model learns patterns from examples. the quick brown fox jumps over the lazy dog. once upon a time a curious mouse explored a quiet forest. the mouse found a tiny house beside a river. the sun was bright and the birds were singing. machines can learn from data and generate new sentences. learning takes practice patience and many examples. the robot likes science computers and making things. the world is full of interesting ideas and questions. a tiny computer can learn simple patterns. the machine studies language and predicts the future. "
//  ============================================================
//  MODEL STORAGE
//  ============================================================
let counts = []
for (i = 0; i < CONTEXTS * VOCAB; i++) {
    counts.push(0)
}
let trained = [0]
//  ============================================================
//  TOKENIZER
//  ============================================================
function char_index(ch: string): number {
    return ALPHABET.indexOf(ch.toLowerCase()) >= 0 ? ALPHABET.indexOf(ch.toLowerCase()) : ALPHABET.indexOf(" ")
}

function normalize_char(ch: string): string {
    return ALPHABET.charAt(char_index(ch))
}

function get_context(a: string, b: string): number {
    return (char_index(a) * VOCAB + char_index(b)) % CONTEXTS
}

//  ============================================================
//  TRAINING
//  ============================================================
function reset_model() {
    for (let i = 0; i < counts.length; i++) {
        counts[i] = 0
    }
    trained[0] = 0
}

function learn(text: string) {
    let ch: string;
    let context: number;
    let next_char: number;
    let index: number;
    text = text.toLowerCase()
    let a = " "
    let b = " "
    for (let i = 0; i < text.length; i++) {
        ch = normalize_char(text.charAt(i))
        context = get_context(a, b)
        next_char = char_index(ch)
        index = context * VOCAB + next_char
        if (counts[index] < MAX_COUNT) {
            counts[index] = counts[index] + 1
        }
        
        trained[0] = trained[0] + 1
        a = b
        b = ch
    }
}

function train() {
    reset_model()
    learn(STARTER_TEXT)
}

//  ============================================================
//  NEXT CHARACTER PREDICTION
//  ============================================================
function predict(a: string, b: string): string {
    let i: number;
    let context = get_context(a, b)
    let row = context * VOCAB
    let total = 0
    for (i = 0; i < VOCAB; i++) {
        total = total + counts[row + i]
    }
    if (total == 0) {
        return ALPHABET.charAt(Math.randomRange(0, VOCAB - 1))
    }
    
    //  Weighted random sampling
    let pick = Math.randomRange(1, total)
    for (i = 0; i < VOCAB; i++) {
        pick = pick - counts[row + i]
        if (pick <= 0) {
            return ALPHABET.charAt(i)
        }
        
    }
    return " "
}

//  ============================================================
//  TEXT GENERATION
//  ============================================================
function generate(prompt: string, amount: number): string {
    let i: number;
    let ch: string;
    let next_char: string;
    prompt = prompt.toLowerCase()
    let a = " "
    let b = " "
    let output = ""
    for (i = 0; i < prompt.length; i++) {
        ch = normalize_char(prompt.charAt(i))
        output = output + ch
        a = b
        b = ch
    }
    if (output == "") {
        output = "the "
        a = "h"
        b = " "
    }
    
    for (i = 0; i < amount; i++) {
        next_char = predict(a, b)
        output = output + next_char
        a = b
        b = next_char
    }
    return output
}

//  ============================================================
//  SERIAL INTERFACE
//  ============================================================
function show_help() {
    serial.writeLine("")
    serial.writeLine("=== MicroSLM ===")
    serial.writeLine("GEN prompt")
    serial.writeLine("LEARN text")
    serial.writeLine("RESET")
    serial.writeLine("INFO")
    serial.writeLine("HELP")
    serial.writeLine("")
}

function handle_command(line: string) {
    let text: string;
    let prompt: string;
    let result: string;
    line = line.replace("\r", "")
    line = line.replace("\n", "")
    if (line.length == 0) {
        return
    }
    
    let upper = line.toUpperCase()
    if (upper == "HELP") {
        show_help()
    } else if (upper == "INFO") {
        serial.writeLine("MicroSLM 1.0")
        serial.writeLine("Model: hashed trigram")
        serial.writeLine("Vocabulary: " + ("" + VOCAB))
        serial.writeLine("Contexts: " + ("" + CONTEXTS))
        serial.writeLine("Training transitions: " + ("" + trained[0]))
    } else if (upper == "RESET") {
        train()
        serial.writeLine("Model reset.")
        serial.writeLine("Starter training complete.")
    } else if (upper.substr(0, 6) == "LEARN ") {
        text = line.substr(6, line.length - 6)
        learn(text)
        serial.writeLine("Learned new text.")
        serial.writeLine("Transitions: " + ("" + trained[0]))
    } else if (upper.substr(0, 4) == "GEN ") {
        prompt = line.substr(4, line.length - 4)
        result = generate(prompt, GEN_LENGTH)
        serial.writeLine(result)
    } else {
        result = generate(line, GEN_LENGTH)
        serial.writeLine(result)
    }
    
}

//  ============================================================
//  BUTTON CONTROLS
//  ============================================================
//  ============================================================
//  STARTUP
//  ============================================================
serial.redirectToUSB()
serial.setBaudRate(BaudRate.BaudRate115200)
train()
serial.writeLine("")
serial.writeLine("========================")
serial.writeLine("MicroSLM 1.0")
serial.writeLine("MakeCode Python")
serial.writeLine("micro:bit V2 ready")
serial.writeLine("========================")
serial.writeLine("Type HELP for commands.")
serial.writeLine("Training: " + ("" + trained[0]))
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function serial_received() {
    let line = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    handle_command(line)
})
input.onButtonPressed(Button.A, function button_a() {
    let result = generate("the ", 40)
    serial.writeLine(result)
    basic.showIcon(IconNames.Happy)
})
input.onButtonPressed(Button.B, function button_b() {
    serial.writeLine("Training transitions: " + ("" + trained[0]))
    basic.showNumber(trained[0] % 10000)
})
input.onButtonPressed(Button.AB, function button_ab() {
    train()
    serial.writeLine("Model reset.")
    basic.showIcon(IconNames.Yes)
})
basic.showIcon(IconNames.SmallDiamond)
