/* eslint-disable no-unused-vars */
import { Buffer } from "./buffer";
import { JSONHandler } from "assemblyscript-json";

export { CustomJSONDecoder as JSONDecoder, CustomJSONHandler as JSONHandler };

abstract class CustomJSONHandler extends JSONHandler {
  setString(name: string, value: string): void {}

  setBoolean(name: string, value: bool): void {}

  setNull(name: string): void {}

  setInteger(name: string, value: i64): void {}

  setFloat(name: string, value: f64): void {}

  pushArray(name: string): bool {
    return true;
  }

  popArray(): void {}

  pushObject(name: string): bool {
    return true;
  }

  popObject(): void {}
}

const TRUE_STR = "true";
const FALSE_STR = "false";
const NULL_STR = "null";
const CHAR_0 = "0".charCodeAt(0);
const CHAR_9 = "9".charCodeAt(0);
const CHAR_A = "A".charCodeAt(0);
const CHAR_A_LOWER = "a".charCodeAt(0);

class DecoderState {
  lastKey: string = "";
  readIndex: i32 = 0;
  constructor(public buffer: Uint8Array) {}

  get ptr(): usize {
    return Buffer.getDataPtr(this.buffer);
  }

  readString(start: usize, end: usize = this.readIndex): string {
    return Buffer.readString(this.buffer, start, end - 1);
  }
}

class CustomJSONDecoder<CustomJSONHandlerT extends CustomJSONHandler> {
  handler: CustomJSONHandlerT;
  state: DecoderState = new DecoderState(new Uint8Array(0));

  constructor(handler: CustomJSONHandlerT) {
    this.handler = handler;
  }

  deserialize(buffer: Uint8Array, decoderState: DecoderState | null = null): void {
    if (decoderState != null) {
      this.state = decoderState;
    } else {
      this.state = new DecoderState(buffer);
    }

    assert(this.parseValue(), "Cannot parse JSON");
    // TODO: Error if input left
  }

  private peekChar(): i32 {
    if (this.state.readIndex >= this.state.buffer.length) {
      return -1;
    }
    return this.state.buffer[this.state.readIndex];
  }

  private readChar(): i32 {
    assert(this.state.readIndex < this.state.buffer.length, "Unexpected input end");
    return this.state.buffer[this.state.readIndex++];
  }

  private parseValue(): bool {
    this.skipWhitespace();
    const result =
      this.parseObject() ||
      this.parseArray() ||
      this.parseString() ||
      this.parseBoolean() ||
      this.parseNumber() ||
      this.parseNull();
    this.skipWhitespace();
    return result;
  }

  private parseObject(): bool {
    if (this.peekChar() != "{".charCodeAt(0)) {
      return false;
    }
    const key = this.state.lastKey;
    this.state.lastKey = "";
    if (this.handler.pushObject(key)) {
      this.readChar();
      this.skipWhitespace();

      let firstItem = true;
      while (this.peekChar() != "}".charCodeAt(0)) {
        if (!firstItem) {
          assert(this.readChar() == ",".charCodeAt(0), "Expected ','");
        } else {
          firstItem = false;
        }
        this.parseKey();
        this.parseValue();
      }
      assert(this.readChar() == "}".charCodeAt(0), "Unexpected end of object");
    }
    this.handler.popObject();
    return true;
  }

  private parseKey(): void {
    this.skipWhitespace();
    this.state.lastKey = this.readString();
    this.skipWhitespace();
    assert(this.readChar() == ":".charCodeAt(0), "Expected ':'");
  }

  private parseArray(): bool {
    if (this.peekChar() != "[".charCodeAt(0)) {
      return false;
    }
    const key = this.state.lastKey;
    this.state.lastKey = "";
    if (this.handler.pushArray(key)) {
      this.readChar();
      this.skipWhitespace();

      let firstItem = true;
      while (this.peekChar() != "]".charCodeAt(0)) {
        if (!firstItem) {
          assert(this.readChar() == ",".charCodeAt(0), "Expected ','");
        } else {
          firstItem = false;
        }
        this.parseValue();
      }
      assert(this.readChar() == "]".charCodeAt(0), "Unexpected end of array");
    }
    this.handler.popArray();
    return true;
  }

  private parseString(): bool {
    if (this.peekChar() != '"'.charCodeAt(0)) {
      return false;
    }
    this.handler.setString(this.state.lastKey, this.readString());
    return true;
  }

  private readString(): string {
    assert(this.readChar() == '"'.charCodeAt(0), "Expected double-quoted string");
    let savedIndex = this.state.readIndex;
    const stringParts: Array<string> = new Array<string>();
    for (;;) {
      const byte = this.readChar();
      assert(byte >= 0x20, "Unexpected control character");
      if (byte == '"'.charCodeAt(0)) {
        const s = this.state.readString(savedIndex);
        if (stringParts.length == 0) {
          return s;
        }
        stringParts.push(s);
        return stringParts.join("");
      } else if (byte == "\\".charCodeAt(0)) {
        if (this.state.readIndex > savedIndex + 1) {
          stringParts.push(this.state.readString(savedIndex));
        }
        stringParts.push(this.readEscapedChar());
        savedIndex = this.state.readIndex;
      }
    }
    return "";
  }

  private readEscapedChar(): string {
    const byte = this.readChar();
    // TODO: Use lookup table for anything except \u
    if (byte == '"'.charCodeAt(0)) {
      return '"';
    }
    if (byte == "\\".charCodeAt(0)) {
      return "\\";
    }
    if (byte == "/".charCodeAt(0)) {
      return "/";
    }
    if (byte == "b".charCodeAt(0)) {
      return "\b";
    }
    if (byte == "n".charCodeAt(0)) {
      return "\n";
    }
    if (byte == "r".charCodeAt(0)) {
      return "\r";
    }
    if (byte == "t".charCodeAt(0)) {
      return "\t";
    }
    if (byte == "u".charCodeAt(0)) {
      const d1 = this.readHexDigit();
      const d2 = this.readHexDigit();
      const d3 = this.readHexDigit();
      const d4 = this.readHexDigit();
      const charCode = d1 * 0x1000 + d2 * 0x100 + d3 * 0x10 + d4;
      return String.fromCodePoint(charCode);
    }
    assert(false, "Unexpected escaped character: " + String.fromCharCode(byte));
    return "";
  }

  private readHexDigit(): i32 {
    const byte = this.readChar();
    let digit = byte - CHAR_0;
    if (digit > 9) {
      digit = byte - CHAR_A + 10;
      if (digit < 10 || digit > 15) {
        digit = byte - CHAR_A_LOWER + 10;
      }
    }
    assert(digit >= 0 && digit < 16, "Unexpected \\u digit");
    return digit;
  }

  private parseNumber(): bool {
    let sign: i64 = 1;
    if (this.peekChar() == "-".charCodeAt(0)) {
      sign = -1;
      this.readChar();
    }
    let digits = 0;
    let numStr = "";
    while (
      (CHAR_0 <= this.peekChar() && this.peekChar() <= CHAR_9) ||
      this.peekChar() == ".".charCodeAt(0) ||
      this.peekChar() == "e".charCodeAt(0) ||
      this.peekChar() == "E".charCodeAt(0)
    ) {
      numStr = numStr.concat(String.fromCharCode(this.readChar()));
      digits++;
    }
    if (digits > 0) {
      if (numStr.indexOf(".") > 0) {
        this.handler.setFloat(this.state.lastKey, parseFloat(numStr) * (sign as f64));
      } else {
        this.handler.setInteger(this.state.lastKey, (parseInt(numStr) as i64) * sign);
      }
      return true;
    }
    return false;
  }

  private parseBoolean(): bool {
    if (this.peekChar() == FALSE_STR.charCodeAt(0)) {
      this.readAndAssert(FALSE_STR);
      this.handler.setBoolean(this.state.lastKey, false);
      return true;
    }
    if (this.peekChar() == TRUE_STR.charCodeAt(0)) {
      this.readAndAssert(TRUE_STR);
      this.handler.setBoolean(this.state.lastKey, true);
      return true;
    }

    return false;
  }

  private parseNull(): bool {
    if (this.peekChar() == NULL_STR.charCodeAt(0)) {
      this.readAndAssert(NULL_STR);
      this.handler.setNull(this.state.lastKey);
      return true;
    }
    return false;
  }

  private readAndAssert(str: string): void {
    for (let i = 0; i < str.length; i++) {
      assert(str.charCodeAt(i) == this.readChar(), "Expected '" + str + "'");
    }
  }

  private skipWhitespace(): void {
    while (this.isWhitespace(this.peekChar())) {
      this.readChar();
    }
  }

  private isWhitespace(charCode: i32): bool {
    return charCode == 0x9 || charCode == 0xa || charCode == 0xd || charCode == 0x20;
  }
}
