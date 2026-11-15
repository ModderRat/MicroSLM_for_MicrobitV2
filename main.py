"""

counts[previous character][next character]

"""
def trainStarterModel():
    clearModel()
    learn(STARTER_TEXT)
def predictNext(previous: str):
    global row, total, pick
    row = charIndex(previous) * VOCAB
    l = 0
    while l <= VOCAB - 1:
        total += counts[row + l]
        l += 1
    # If this context has not been seen, choose a random letter/space.
    if total == 0:
        return ALPHABET.char_at(Math.random_range(0, VOCAB - 1))
    pick = Math.random_range(1, total)
    m = 0
    while m <= VOCAB - 1:
        pick += 0 - counts[row + m]
        if pick <= 0:
            return ALPHABET.char_at(m)
        m += 1
    return " "

def on_button_pressed_a():
    global result
    result = generate("the ", 24)
    basic.show_string(result)
input.on_button_pressed(Button.A, on_button_pressed_a)

def handleCommand(line: str):
    line = line.trim()
    if len(line) == 0:
        return
    if line.to_upper_case() == "HELP":
        showHelp()
    elif line.to_upper_case() == "RESET":
        trainStarterModel()
        serial.write_line("Model reset to starter corpus.")
    elif line.to_upper_case().substr(0, 6) == "LEARN ":
        text2 = line.substr(6)
        learn(text2)
        serial.write_line("Learned text. Training transitions: " + ("" + str(trainedCharacters)))
    elif line.to_upper_case().substr(0, 4) == "GEN ":
        prompt2 = line.substr(4)
        serial.write_line("" + (generate(prompt2, MAX_OUTPUT)))
    else:
        # Treat an unprefixed line as a generation prompt.
        serial.write_line("" + (generate(line, MAX_OUTPUT)))
def charIndex(ch: str):
    global i
    ch = ch.to_lower_case()
    i = ALPHABET.index_of(ch)
    if i < 0:
        return ALPHABET.index_of(" ")
    return i

def on_button_pressed_b():
    basic.show_number(trainedCharacters)
input.on_button_pressed(Button.B, on_button_pressed_b)

def generate(prompt: str, length: number):
    global output, previous2
    prompt = prompt.to_lower_case()
    if len(prompt) == 0:
        prompt = "the "
    output = prompt
    previous2 = prompt.char_at(len(prompt) - 1)
    for index2 in range(length):
        next2 = predictNext(previous2)
        output = "" + output + next2
        previous2 = next2
    return output
def showHelp():
    serial.write_line("")
    serial.write_line("MicroSLM MakeCode")
    serial.write_line("Commands:")
    serial.write_line("GEN your prompt")
    serial.write_line("LEARN text to learn")
    serial.write_line("RESET")
    serial.write_line("HELP")
    serial.write_line("Vocabulary: lowercase a-z and space")
    serial.write_line("")

def on_data_received():
    global line2
    line2 = serial.read_until(serial.delimiters(Delimiters.NEW_LINE))
    handleCommand(line2)
serial.on_data_received(serial.delimiters(Delimiters.NEW_LINE), on_data_received)

def clearModel():
    global counts, trainedCharacters
    counts = []
    for index22 in range(VOCAB * VOCAB):
        counts.append(0)
    trainedCharacters = 0
def learn(text: str):
    global trainedCharacters
    text = text.to_lower_case()
    if len(text) < 2:
        return
    k = 0
    while k <= len(text) - 1 - 1:
        a = charIndex(text.char_at(k))
        b = charIndex(text.char_at(k + 1))
        index = a * VOCAB + b
        # Saturate counts to avoid integer overflow.
        if counts[index] < 250:
            counts[index] = counts[index] + 1
        trainedCharacters += 1
        k += 1
line2 = ""
previous2 = ""
output = ""
prompt3 = ""
i = 0
result = ""
pick = 0
counts: List[number] = []
total = 0
row = 0
trainedCharacters = 0
STARTER_TEXT = ""
MAX_OUTPUT = 0
VOCAB = 0
ALPHABET = ""
# MicroSLM — single-file MakeCode program for BBC micro:bit V2
# Paste this entire file into the MakeCode JavaScript editor.
# 
# Serial commands (USB serial, newline terminated):
# GEN the little robot       Generate text from a prompt
# LEARN the little robot ... Add text to the model's training counts
# RESET                       Reset to the built-in training corpus
# HELP                        Show commands
# 
# This is a compact character-level bigram statistical language model.
# It learns transition frequencies from text and samples the next character.
# It is not a neural network.
ALPHABET = "abcdefghijklmnopqrstuvwxyz "
VOCAB = 27
MAX_OUTPUT = 120
STARTER_TEXT = "the little robot is learning to speak. " + "the robot can read and write words. " + "once upon a time there was a tiny machine. " + "the machine learned from examples. " + "learning takes practice and patience. " + "the quick brown fox jumps over the lazy dog. " + "hello world. " + "the small model predicts the next character. " + "the curious mouse explored the forest. " + "it found a little house near the river. " + "the sun is shining and the birds are singing. " + "machines learn patterns from data. " + "the world is full of interesting things. "
basic.show_icon(IconNames.SMALL_DIAMOND)
serial.redirect_to_usb()
serial.set_baud_rate(BaudRate.BAUD_RATE115200)
trainStarterModel()
serial.write_line("")
serial.write_line("MicroSLM ready — micro:bit V2")
serial.write_line("Type HELP for commands.")
serial.write_line("Starter transitions: " + ("" + str(trainedCharacters)))