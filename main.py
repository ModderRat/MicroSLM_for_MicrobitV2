
# ============================================================
# MicroSLM 1.0
# Small Language Model
# Microsoft MakeCode Python
# BBC micro:bit V2
# ============================================================

ALPHABET = "abcdefghijklmnopqrstuvwxyz .,!?'-"
VOCAB = ALPHABET.length

CONTEXTS = 64
MAX_COUNT = 250
GEN_LENGTH = 80

STARTER_TEXT = (
    "hello there. the little robot is learning to talk. "
    "it reads text and predicts what character comes next. "
    "a small language model learns patterns from examples. "
    "the quick brown fox jumps over the lazy dog. "
    "once upon a time a curious mouse explored a quiet forest. "
    "the mouse found a tiny house beside a river. "
    "the sun was bright and the birds were singing. "
    "machines can learn from data and generate new sentences. "
    "learning takes practice patience and many examples. "
    "the robot likes science computers and making things. "
    "the world is full of interesting ideas and questions. "
    "a tiny computer can learn simple patterns. "
    "the machine studies language and predicts the future. "
)

# ============================================================
# MODEL STORAGE
# ============================================================

counts = []

for i in range(CONTEXTS * VOCAB):
    counts.append(0)

trained = [0]


# ============================================================
# TOKENIZER
# ============================================================

def char_index(ch):
    return ALPHABET.index_of(ch.to_lower_case()) if ALPHABET.index_of(ch.to_lower_case()) >= 0 else ALPHABET.index_of(" ")


def normalize_char(ch):
    return ALPHABET.char_at(char_index(ch))


def get_context(a, b):
    return (
        char_index(a) * VOCAB +
        char_index(b)
    ) % CONTEXTS


# ============================================================
# TRAINING
# ============================================================

def reset_model():
    for i in range(counts.length):
        counts[i] = 0

    trained[0] = 0


def learn(text):
    text = text.to_lower_case()

    a = " "
    b = " "

    for i in range(text.length):
        ch = normalize_char(text.char_at(i))

        context = get_context(a, b)
        next_char = char_index(ch)

        index = context * VOCAB + next_char

        if counts[index] < MAX_COUNT:
            counts[index] = counts[index] + 1

        trained[0] = trained[0] + 1

        a = b
        b = ch


def train():
    reset_model()
    learn(STARTER_TEXT)


# ============================================================
# NEXT CHARACTER PREDICTION
# ============================================================

def predict(a, b):
    context = get_context(a, b)
    row = context * VOCAB

    total = 0

    for i in range(VOCAB):
        total = total + counts[row + i]

    if total == 0:
        return ALPHABET.char_at(
            Math.random_range(0, VOCAB - 1)
        )

    # Weighted random sampling
    pick = Math.random_range(1, total)

    for i in range(VOCAB):
        pick = pick - counts[row + i]

        if pick <= 0:
            return ALPHABET.char_at(i)

    return " "


# ============================================================
# TEXT GENERATION
# ============================================================

def generate(prompt, amount):
    prompt = prompt.to_lower_case()

    a = " "
    b = " "
    output = ""

    for i in range(prompt.length):
        ch = normalize_char(prompt.char_at(i))

        output = output + ch

        a = b
        b = ch

    if output == "":
        output = "the "
        a = "h"
        b = " "

    for i in range(amount):
        next_char = predict(a, b)

        output = output + next_char

        a = b
        b = next_char

    return output


# ============================================================
# SERIAL INTERFACE
# ============================================================

def show_help():
    serial.write_line("")
    serial.write_line("=== MicroSLM ===")
    serial.write_line("GEN prompt")
    serial.write_line("LEARN text")
    serial.write_line("RESET")
    serial.write_line("INFO")
    serial.write_line("HELP")
    serial.write_line("")


def handle_command(line):
    line = line.replace("\r", "")
    line = line.replace("\n", "")

    if line.length == 0:
        return

    upper = line.to_upper_case()

    if upper == "HELP":
        show_help()

    elif upper == "INFO":
        serial.write_line("MicroSLM 1.0")
        serial.write_line("Model: hashed trigram")
        serial.write_line("Vocabulary: " + str(VOCAB))
        serial.write_line("Contexts: " + str(CONTEXTS))
        serial.write_line("Training transitions: " + str(trained[0]))

    elif upper == "RESET":
        train()
        serial.write_line("Model reset.")
        serial.write_line("Starter training complete.")

    elif upper.substr(0, 6) == "LEARN ":
        text = line.substr(6, line.length - 6)

        learn(text)

        serial.write_line("Learned new text.")
        serial.write_line("Transitions: " + str(trained[0]))

    elif upper.substr(0, 4) == "GEN ":
        prompt = line.substr(4, line.length - 4)

        result = generate(prompt, GEN_LENGTH)

        serial.write_line(result)

    else:
        result = generate(line, GEN_LENGTH)

        serial.write_line(result)


def serial_received():
    line = serial.read_until(
        serial.delimiters(Delimiters.NEW_LINE)
    )

    handle_command(line)


# ============================================================
# BUTTON CONTROLS
# ============================================================

def button_a():
    result = generate("the ", 40)

    serial.write_line(result)

    basic.show_icon(IconNames.HAPPY)


def button_b():
    serial.write_line(
        "Training transitions: " + str(trained[0])
    )

    basic.show_number(trained[0] % 10000)


def button_ab():
    train()

    serial.write_line("Model reset.")

    basic.show_icon(IconNames.YES)


# ============================================================
# STARTUP
# ============================================================

serial.redirect_to_usb()
serial.set_baud_rate(BaudRate.BAUD_RATE115200)

train()

serial.write_line("")
serial.write_line("========================")
serial.write_line("MicroSLM 1.0")
serial.write_line("MakeCode Python")
serial.write_line("micro:bit V2 ready")
serial.write_line("========================")
serial.write_line("Type HELP for commands.")
serial.write_line("Training: " + str(trained[0]))

serial.on_data_received(
    serial.delimiters(Delimiters.NEW_LINE),
    serial_received
)

input.on_button_pressed(Button.A, button_a)
input.on_button_pressed(Button.B, button_b)
input.on_button_pressed(Button.AB, button_ab)

basic.show_icon(IconNames.SMALL_DIAMOND)
