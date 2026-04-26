var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/picomatch/lib/constants.js
var require_constants = __commonJS({
  "node_modules/picomatch/lib/constants.js"(exports, module) {
    "use strict";
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var SEP = "/";
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR,
      SEP
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
      SEP: "\\"
    };
    var POSIX_REGEX_SOURCE = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module.exports = {
      DEFAULT_MAX_EXTGLOB_RECURSION,
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        __proto__: null,
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// node_modules/picomatch/lib/utils.js
var require_utils = __commonJS({
  "node_modules/picomatch/lib/utils.js"(exports) {
    "use strict";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants();
    exports.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports.isRegexChar = (str) => str.length === 1 && exports.hasRegexChars(str);
    exports.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports.isWindows = () => {
      if (typeof navigator !== "undefined" && navigator.platform) {
        const platform = navigator.platform.toLowerCase();
        return platform === "win32" || platform === "windows";
      }
      if (typeof process !== "undefined" && process.platform) {
        return process.platform === "win32";
      }
      return false;
    };
    exports.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === "\\") return exports.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };
    exports.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
    exports.basename = (path, { windows } = {}) => {
      const segs = path.split(windows ? /[\\/]/ : "/");
      const last = segs[segs.length - 1];
      if (last === "") {
        return segs[segs.length - 2];
      }
      return last;
    };
  }
});

// node_modules/picomatch/lib/scan.js
var require_scan = __commonJS({
  "node_modules/picomatch/lib/scan.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input, options) => {
      const opts = options || {};
      const length = input.length - 1;
      const scanToEnd = opts.parts === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts = [];
      let str = input;
      let index = -1;
      let start = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let negatedExtglob = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true) continue;
          if (prev === CHAR_DOT && index === start + 1) {
            start += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (code === CHAR_EXCLAMATION_MARK && index === start) {
              negatedExtglob = true;
            }
            if (scanToEnd === true) {
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  code = advance();
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES) {
                  isGlob = token.isGlob = true;
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
          negated = token.negated = true;
          start++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_LEFT_PARENTHESES) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start > 0) {
        prefix = str.slice(0, start);
        str = str.slice(start);
        lastIndex -= start;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob) glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input,
        start,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated,
        negatedExtglob
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n = prevIndex ? prevIndex + 1 : start;
          const i = slashes[idx];
          const value = input.slice(n, i);
          if (opts.tokens) {
            if (idx === 0 && start !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (idx !== 0 || value !== "") {
            parts.push(value);
          }
          prevIndex = i;
        }
        if (prevIndex && prevIndex + 1 < input.length) {
          const value = input.slice(prevIndex + 1);
          parts.push(value);
          if (opts.tokens) {
            tokens[tokens.length - 1].value = value;
            depth(tokens[tokens.length - 1]);
            state.maxDepth += tokens[tokens.length - 1].depth;
          }
        }
        state.slashes = slashes;
        state.parts = parts;
      }
      return state;
    };
    module.exports = scan;
  }
});

// node_modules/picomatch/lib/parse.js
var require_parse = __commonJS({
  "node_modules/picomatch/lib/parse.js"(exports, module) {
    "use strict";
    var constants4 = require_constants();
    var utils = require_utils();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants4;
    var expandRange = (args, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args, options);
      }
      args.sort();
      const value = `[${args.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args.map((v2) => utils.escapeRegex(v2)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var splitTopLevel = (input) => {
      const parts = [];
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let value = "";
      let escaped = false;
      for (const ch of input) {
        if (escaped === true) {
          value += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          value += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          value += ch;
          continue;
        }
        if (quote === 0) {
          if (ch === "[") {
            bracket++;
          } else if (ch === "]" && bracket > 0) {
            bracket--;
          } else if (bracket === 0) {
            if (ch === "(") {
              paren++;
            } else if (ch === ")" && paren > 0) {
              paren--;
            } else if (ch === "|" && paren === 0) {
              parts.push(value);
              value = "";
              continue;
            }
          }
        }
        value += ch;
      }
      parts.push(value);
      return parts;
    };
    var isPlainBranch = (branch) => {
      let escaped = false;
      for (const ch of branch) {
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(ch)) {
          return false;
        }
      }
      return true;
    };
    var normalizeSimpleBranch = (branch) => {
      let value = branch.trim();
      let changed = true;
      while (changed === true) {
        changed = false;
        if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
          value = value.slice(2, -1);
          changed = true;
        }
      }
      if (!isPlainBranch(value)) {
        return;
      }
      return value.replace(/\\(.)/g, "$1");
    };
    var hasRepeatedCharPrefixOverlap = (branches) => {
      const values = branches.map(normalizeSimpleBranch).filter(Boolean);
      for (let i = 0; i < values.length; i++) {
        for (let j2 = i + 1; j2 < values.length; j2++) {
          const a = values[i];
          const b2 = values[j2];
          const char = a[0];
          if (!char || a !== char.repeat(a.length) || b2 !== char.repeat(b2.length)) {
            continue;
          }
          if (a === b2 || a.startsWith(b2) || b2.startsWith(a)) {
            return true;
          }
        }
      }
      return false;
    };
    var parseRepeatedExtglob = (pattern, requireEnd = true) => {
      if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
        return;
      }
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let escaped = false;
      for (let i = 1; i < pattern.length; i++) {
        const ch = pattern[i];
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          continue;
        }
        if (quote === 1) {
          continue;
        }
        if (ch === "[") {
          bracket++;
          continue;
        }
        if (ch === "]" && bracket > 0) {
          bracket--;
          continue;
        }
        if (bracket > 0) {
          continue;
        }
        if (ch === "(") {
          paren++;
          continue;
        }
        if (ch === ")") {
          paren--;
          if (paren === 0) {
            if (requireEnd === true && i !== pattern.length - 1) {
              return;
            }
            return {
              type: pattern[0],
              body: pattern.slice(2, i),
              end: i
            };
          }
        }
      }
    };
    var getStarExtglobSequenceOutput = (pattern) => {
      let index = 0;
      const chars = [];
      while (index < pattern.length) {
        const match = parseRepeatedExtglob(pattern.slice(index), false);
        if (!match || match.type !== "*") {
          return;
        }
        const branches = splitTopLevel(match.body).map((branch2) => branch2.trim());
        if (branches.length !== 1) {
          return;
        }
        const branch = normalizeSimpleBranch(branches[0]);
        if (!branch || branch.length !== 1) {
          return;
        }
        chars.push(branch);
        index += match.end + 1;
      }
      if (chars.length < 1) {
        return;
      }
      const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
      return `${source}*`;
    };
    var repeatedExtglobRecursion = (pattern) => {
      let depth = 0;
      let value = pattern.trim();
      let match = parseRepeatedExtglob(value);
      while (match) {
        depth++;
        value = match.body.trim();
        match = parseRepeatedExtglob(value);
      }
      return depth;
    };
    var analyzeRepeatedExtglob = (body, options) => {
      if (options.maxExtglobRecursion === false) {
        return { risky: false };
      }
      const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants4.DEFAULT_MAX_EXTGLOB_RECURSION;
      const branches = splitTopLevel(body).map((branch) => branch.trim());
      if (branches.length > 1) {
        if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
          return { risky: true };
        }
      }
      for (const branch of branches) {
        const safeOutput = getStarExtglobSequenceOutput(branch);
        if (safeOutput) {
          return { risky: true, safeOutput };
        }
        if (repeatedExtglobRecursion(branch) > max) {
          return { risky: true };
        }
      }
      return { risky: false };
    };
    var parse = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      input = REPLACEMENTS[input] || input;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const PLATFORM_CHARS = constants4.globChars(opts.windows);
      const EXTGLOB_CHARS = constants4.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input = utils.removePrefix(input, state);
      len = input.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input[state.index + n];
      const advance = state.advance = () => input[++state.index] || "";
      const remaining = () => input.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren") {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output) append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.output = (prev.output || prev.value) + tok.value;
          prev.value += tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        token.startIndex = state.index;
        token.tokensIndex = tokens.length;
        const output = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push({ type: "paren", extglob: true, value: advance(), output });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        const literal = input.slice(token.startIndex, state.index + 1);
        const body = input.slice(token.startIndex + 2, state.index);
        const analysis = analyzeRepeatedExtglob(body, opts);
        if ((token.type === "plus" || token.type === "star") && analysis.risky) {
          const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : void 0;
          const open2 = tokens[token.tokensIndex];
          open2.type = "text";
          open2.value = literal;
          open2.output = safeOutput || utils.escapeRegex(literal);
          for (let i = token.tokensIndex + 1; i < tokens.length; i++) {
            tokens[i].value = "";
            tokens[i].output = "";
            delete tokens[i].suffix;
          }
          state.output = token.output + open2.output;
          state.backtrack = true;
          push({ type: "paren", extglob: true, value, output: "" });
          decrement("parens");
          return;
        }
        let output = token.close + (opts.capture ? ")" : "");
        let rest;
        if (token.type === "negate") {
          let extglobStar = star;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
            output = token.close = `)$))${extglobStar}`;
          }
          if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
            const expression = parse(rest, { ...options, fastpaths: false }).output;
            output = token.close = `)${expression})${extglobStar})`;
          }
          if (token.prev.type === "bos") {
            state.negatedExtglob = true;
          }
        }
        push({ type: "paren", extglob: true, value, output });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
        let backslashes = false;
        let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m2, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m2;
          }
          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m2 : `\\${m2}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output = output.replace(/\\/g, "");
          } else {
            output = output.replace(/\\+/g, (m2) => {
              return m2.length % 2 === 0 ? "\\\\" : m2 ? "\\" : "";
            });
          }
        }
        if (output === input && opts.contains === true) {
          state.output = input;
          return state;
        }
        state.output = utils.wrapOutput(output, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance();
          } else {
            value += advance();
          }
          if (state.brackets === 0) {
            push({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix = POSIX_REGEX_SOURCE[rest2];
                if (posix) {
                  prev.value = pre + posix;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open2 = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open2);
          push(open2);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push({ type: "text", value, output: value });
            continue;
          }
          let output = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i = arr.length - 1; i >= 0; i--) {
              tokens.pop();
              if (arr[i].type === "brace") {
                break;
              }
              if (arr[i].type !== "dots") {
                range.unshift(arr[i].value);
              }
            }
            output = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output = "\\}";
            state.output = out;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push({ type: "brace", value, output });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output = "|";
          }
          push({ type: "comma", value, output });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".") prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output = value;
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output = `\\${value}`;
            }
            push({ type: "text", value, output });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push({ type: "plus", value });
            continue;
          }
          push({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse.fastpaths = (input, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input = REPLACEMENTS[input] || input;
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants4.globChars(opts.windows);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true) return star;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*.*":
            return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*/*":
            return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;
            const source2 = create(match[1]);
            if (!source2) return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output = utils.removePrefix(input, state);
      let source = create(output);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module.exports = parse;
  }
});

// node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS({
  "node_modules/picomatch/lib/picomatch.js"(exports, module) {
    "use strict";
    var scan = require_scan();
    var parse = require_parse();
    var utils = require_utils();
    var constants4 = require_constants();
    var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch2 = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input) => picomatch2(input, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2) return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix = opts.windows;
      const regex = isState ? picomatch2.compileRe(glob, options) : picomatch2.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch2(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input, returnObject = false) => {
        const { isMatch, match, output } = picomatch2.test(input, regex, options, { glob, posix });
        const result = { glob, state, regex, posix, input, output, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch2.test = (input, regex, options, { glob, posix } = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix ? utils.toPosixSlashes : null);
      let match = input === glob;
      let output = match && format ? format(input) : input;
      if (match === false) {
        output = format ? format(input) : input;
        match = output === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch2.matchBase(input, regex, options, posix);
        } else {
          match = regex.exec(output);
        }
      }
      return { isMatch: Boolean(match), match, output };
    };
    picomatch2.matchBase = (input, glob, options) => {
      const regex = glob instanceof RegExp ? glob : picomatch2.makeRe(glob, options);
      return regex.test(utils.basename(input));
    };
    picomatch2.isMatch = (str, patterns, options) => picomatch2(patterns, options)(str);
    picomatch2.parse = (pattern, options) => {
      if (Array.isArray(pattern)) return pattern.map((p2) => picomatch2.parse(p2, options));
      return parse(pattern, { ...options, fastpaths: false });
    };
    picomatch2.scan = (input, options) => scan(input, options);
    picomatch2.compileRe = (state, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return state.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${state.output})${append}`;
      if (state && state.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch2.toRegex(source, options);
      if (returnState === true) {
        regex.state = state;
      }
      return regex;
    };
    picomatch2.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
      if (!input || typeof input !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      let parsed = { negated: false, fastpaths: true };
      if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
        parsed.output = parse.fastpaths(input, options);
      }
      if (!parsed.output) {
        parsed = parse(input, options);
      }
      return picomatch2.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch2.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err) {
        if (options && options.debug === true) throw err;
        return /$^/;
      }
    };
    picomatch2.constants = constants4;
    module.exports = picomatch2;
  }
});

// node_modules/picomatch/index.js
var require_picomatch2 = __commonJS({
  "node_modules/picomatch/index.js"(exports, module) {
    "use strict";
    var pico = require_picomatch();
    var utils = require_utils();
    function picomatch2(glob, options, returnState = false) {
      if (options && (options.windows === null || options.windows === void 0)) {
        options = { ...options, windows: utils.isWindows() };
      }
      return pico(glob, options, returnState);
    }
    Object.assign(picomatch2, pico);
    module.exports = picomatch2;
  }
});

// dist/src/core/config.js
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
var DEFAULT_CONFIG = {
  enabled: true,
  enableAllHooksByDefault: false,
  enabledHooks: [],
  disabledHooks: [],
  maxContextChars: 2e4,
  includeUserRules: false
};
function parseHookList(value) {
  if (value === void 0) {
    return [];
  }
  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    return [];
  }
  const listValue = trimmedValue.startsWith("[") && trimmedValue.endsWith("]") ? trimmedValue.slice(1, -1) : trimmedValue;
  return dedupeHookIds(listValue.split(",").map((hookId) => cleanScalarValue(hookId)));
}
function mergeConfig(base, override) {
  return {
    enabled: override.enabled ?? base.enabled,
    enableAllHooksByDefault: override.enableAllHooksByDefault ?? base.enableAllHooksByDefault,
    enabledHooks: override.enabledHooks !== void 0 ? dedupeHookIds(override.enabledHooks) : base.enabledHooks,
    disabledHooks: override.disabledHooks !== void 0 ? dedupeHookIds(override.disabledHooks) : base.disabledHooks,
    maxContextChars: override.maxContextChars ?? base.maxContextChars,
    includeUserRules: override.includeUserRules ?? base.includeUserRules
  };
}
function readEnvironmentConfig(environment = process.env) {
  const config = {};
  const enabledHooks = parseHookList(environment.CLAUDE_PLUGIN_OPTION_ENABLED_HOOKS);
  if (enabledHooks.length > 0) {
    config.enabledHooks = enabledHooks;
  }
  const disabledHooks = parseHookList(environment.CLAUDE_PLUGIN_OPTION_DISABLED_HOOKS);
  if (disabledHooks.length > 0) {
    config.disabledHooks = disabledHooks;
  }
  const enableAllHooksByDefault = parseBooleanValue(environment.CLAUDE_PLUGIN_OPTION_ENABLE_ALL_HOOKS_BY_DEFAULT);
  if (enableAllHooksByDefault !== void 0) {
    config.enableAllHooksByDefault = enableAllHooksByDefault;
  }
  const maxContextChars = parsePositiveIntegerValue(environment.CLAUDE_PLUGIN_OPTION_MAX_CONTEXT_CHARS);
  if (maxContextChars !== void 0) {
    config.maxContextChars = maxContextChars;
  }
  const includeUserRules = parseBooleanValue(environment.CLAUDE_PLUGIN_OPTION_INCLUDE_USER_RULES);
  if (includeUserRules !== void 0) {
    config.includeUserRules = includeUserRules;
  }
  return config;
}
function parseProjectLocalFrontmatter(markdown) {
  const frontmatter = extractFrontmatter(markdown);
  if (frontmatter === void 0) {
    return {};
  }
  const fields = parseFrontmatterFields(frontmatter);
  const config = {};
  const enabled = parseBooleanValue(fields.enabled);
  if (enabled !== void 0) {
    config.enabled = enabled;
  }
  const enableAllHooksByDefault = parseBooleanValue(fields.enable_all_hooks_by_default);
  if (enableAllHooksByDefault !== void 0) {
    config.enableAllHooksByDefault = enableAllHooksByDefault;
  }
  const enabledHooks = parseHookList(fields.enabled_hooks);
  if (enabledHooks.length > 0) {
    config.enabledHooks = enabledHooks;
  }
  const disabledHooks = parseHookList(fields.disabled_hooks);
  if (disabledHooks.length > 0) {
    config.disabledHooks = disabledHooks;
  }
  const maxContextChars = parsePositiveIntegerValue(fields.max_context_chars);
  if (maxContextChars !== void 0) {
    config.maxContextChars = maxContextChars;
  }
  const includeUserRules = parseBooleanValue(fields.include_user_rules);
  if (includeUserRules !== void 0) {
    config.includeUserRules = includeUserRules;
  }
  return config;
}
function readProjectLocalConfig(cwd) {
  const configPath = join(cwd, ".claude", "hook-pack.local.md");
  if (!existsSync(configPath)) {
    return {};
  }
  return parseProjectLocalFrontmatter(readFileSync(configPath, "utf8"));
}
function loadConfig(cwd, env = process.env) {
  const withEnvironment = mergeConfig(DEFAULT_CONFIG, readEnvironmentConfig(env));
  return mergeConfig(withEnvironment, readProjectLocalConfig(cwd));
}
function extractFrontmatter(markdown) {
  const normalizedMarkdown = markdown.replaceAll("\r\n", "\n");
  const lines = normalizedMarkdown.split("\n");
  if (lines[0] !== "---") {
    return void 0;
  }
  const closingMarkerIndex = lines.findIndex((line, index) => index > 0 && line === "---");
  if (closingMarkerIndex === -1) {
    return void 0;
  }
  return lines.slice(1, closingMarkerIndex).join("\n");
}
function parseFrontmatterFields(frontmatter) {
  const fields = {
    enabled: void 0,
    enable_all_hooks_by_default: void 0,
    enabled_hooks: void 0,
    disabled_hooks: void 0,
    max_context_chars: void 0,
    include_user_rules: void 0
  };
  for (const line of frontmatter.split("\n")) {
    const trimmedLine = line.trim();
    if (trimmedLine === "" || trimmedLine.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmedLine.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmedLine.slice(0, separatorIndex);
    if (!isFrontmatterKey(key)) {
      continue;
    }
    fields[key] = trimmedLine.slice(separatorIndex + 1).trim();
  }
  return fields;
}
function parseBooleanValue(value) {
  if (value === void 0) {
    return void 0;
  }
  const normalizedValue = cleanScalarValue(value).toLowerCase();
  if (normalizedValue === "true") {
    return true;
  }
  if (normalizedValue === "false") {
    return false;
  }
  return void 0;
}
function parsePositiveIntegerValue(value) {
  if (value === void 0) {
    return void 0;
  }
  const normalizedValue = cleanScalarValue(value);
  if (!/^\d+$/.test(normalizedValue)) {
    return void 0;
  }
  const parsedValue = Number.parseInt(normalizedValue, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return void 0;
  }
  return parsedValue;
}
function cleanScalarValue(value) {
  const trimmedValue = value.trim();
  if (trimmedValue.length < 2) {
    return trimmedValue;
  }
  const firstCharacter = trimmedValue[0];
  const lastCharacter = trimmedValue[trimmedValue.length - 1];
  if (firstCharacter === '"' && lastCharacter === '"' || firstCharacter === "'" && lastCharacter === "'") {
    return trimmedValue.slice(1, -1).trim();
  }
  return trimmedValue;
}
function dedupeHookIds(hookIds) {
  const dedupedHookIds = [];
  const seenHookIds = /* @__PURE__ */ new Set();
  for (const hookId of hookIds) {
    const normalizedHookId = hookId.trim();
    if (normalizedHookId === "" || seenHookIds.has(normalizedHookId)) {
      continue;
    }
    seenHookIds.add(normalizedHookId);
    dedupedHookIds.push(normalizedHookId);
  }
  return dedupedHookIds;
}
function isFrontmatterKey(value) {
  return value === "enabled" || value === "enable_all_hooks_by_default" || value === "enabled_hooks" || value === "disabled_hooks" || value === "max_context_chars" || value === "include_user_rules";
}

// dist/src/core/output.js
var PERMISSION_PRIORITY = {
  deny: 4,
  ask: 3,
  allow: 1
};
function combineHookResults(eventName, results) {
  const sortedResults = [...results].sort((left, right) => left.hookId.localeCompare(right.hookId));
  switch (eventName) {
    case "PreToolUse":
      return combinePreToolUseResults(eventName, sortedResults);
    case "Stop":
    case "SubagentStop":
      return combineStopResults(sortedResults);
    case "PostToolUse":
      return combinePostToolUseResults(eventName, sortedResults);
    case "SessionStart":
    case "UserPromptSubmit":
    case "PreCompact":
      return combineContextResults(eventName, sortedResults);
    default:
      return withSystemMessage({}, collectMessages(sortedResults));
  }
}
function combinePreToolUseResults(eventName, sortedResults) {
  const selectedResult = sortedResults.reduce((selected, result) => {
    if (result.permissionDecision === void 0) {
      return selected;
    }
    if (selected?.permissionDecision === void 0) {
      return result;
    }
    const selectedPriority = PERMISSION_PRIORITY[selected.permissionDecision];
    const resultPriority = PERMISSION_PRIORITY[result.permissionDecision];
    return resultPriority > selectedPriority ? result : selected;
  }, void 0);
  if (selectedResult?.permissionDecision === void 0) {
    return withSystemMessage({}, collectMessages(sortedResults));
  }
  const hookSpecificOutput = {
    hookEventName: eventName,
    permissionDecision: selectedResult.permissionDecision,
    ...selectedResult.message === void 0 ? {} : { permissionDecisionReason: selectedResult.message },
    ...selectedResult.updatedInput === void 0 ? {} : { updatedInput: selectedResult.updatedInput }
  };
  return withSystemMessage({ hookSpecificOutput }, collectSelectedMessage(selectedResult));
}
function combineStopResults(sortedResults) {
  const blockResult = sortedResults.find((result) => result.stopDecision === "block");
  if (blockResult !== void 0) {
    const reason = blockResult.message ?? "Blocked by hook";
    return {
      decision: "block",
      reason,
      systemMessage: formatHookLine(blockResult.hookId, reason)
    };
  }
  return withSystemMessage({}, collectMessages(sortedResults));
}
function combinePostToolUseResults(eventName, sortedResults) {
  const blockResult = sortedResults.find((result) => result.stopDecision === "block");
  if (blockResult !== void 0) {
    const reason = blockResult.message ?? "Blocked by hook";
    return {
      decision: "block",
      reason,
      systemMessage: formatHookLine(blockResult.hookId, reason)
    };
  }
  return combineContextResults(eventName, sortedResults);
}
function combineContextResults(eventName, sortedResults) {
  const additionalContext = collectAdditionalContext(sortedResults);
  const output = additionalContext.length === 0 ? {} : {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: additionalContext.join("\n")
    }
  };
  return withSystemMessage(output, collectMessages(sortedResults));
}
function collectMessages(sortedResults) {
  return sortedResults.flatMap(collectSelectedMessage);
}
function collectAdditionalContext(sortedResults) {
  return sortedResults.flatMap((result) => {
    if (result.additionalContext === void 0) {
      return [];
    }
    return [formatHookLine(result.hookId, result.additionalContext)];
  });
}
function collectSelectedMessage(result) {
  if (result.message === void 0) {
    return [];
  }
  return [formatHookLine(result.hookId, result.message)];
}
function formatHookLine(hookId, value) {
  return `${hookId}: ${value}`;
}
function withSystemMessage(output, messages) {
  if (messages.length === 0) {
    return output;
  }
  return {
    ...output,
    systemMessage: messages.join("\n")
  };
}

// dist/src/core/diagnostics.js
function sortDiagnostics(diagnostics) {
  return [...diagnostics].sort((left, right) => {
    const hookIdComparison = (left.hookId ?? "").localeCompare(right.hookId ?? "");
    if (hookIdComparison !== 0) {
      return hookIdComparison;
    }
    return left.code.localeCompare(right.code);
  });
}

// dist/src/core/registry.js
var BUILT_IN_REGISTRY = [
  {
    id: "comment-checker",
    events: ["PreToolUse", "PostToolUse", "PreCompact", "SessionEnd"],
    runner: { kind: "internal", handlerId: "comment-checker" },
    timeoutMs: 8e3,
    defaultEnabled: true
  },
  {
    id: "directory-agents-injector",
    events: ["PostToolUse", "PreCompact", "SessionEnd"],
    runner: { kind: "internal", handlerId: "directory-agents-injector" },
    timeoutMs: 3e3,
    defaultEnabled: true
  },
  {
    id: "directory-readme-injector",
    events: ["PostToolUse", "PreCompact", "SessionEnd"],
    runner: { kind: "internal", handlerId: "directory-readme-injector" },
    timeoutMs: 3e3,
    defaultEnabled: true
  },
  {
    id: "rules-injector",
    events: ["PostToolUse", "PreCompact", "SessionEnd"],
    runner: { kind: "internal", handlerId: "rules-injector" },
    timeoutMs: 4e3,
    defaultEnabled: true
  },
  {
    id: "write-existing-file-guard",
    events: ["PreToolUse", "PostToolUse", "PreCompact", "SessionEnd"],
    runner: { kind: "internal", handlerId: "write-existing-file-guard" },
    timeoutMs: 2e3,
    defaultEnabled: true
  }
];
var HOOK_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
var MIN_TIMEOUT_MS = 1;
var MAX_TIMEOUT_MS = 6e4;
function validateRegistry(registry) {
  const diagnostics = [];
  const seenHookIds = /* @__PURE__ */ new Set();
  for (const entry of registry) {
    if (seenHookIds.has(entry.id)) {
      diagnostics.push({
        level: "error",
        code: "registry.duplicate_id",
        hookId: entry.id,
        message: `Duplicate hook ID: ${entry.id}`
      });
    }
    seenHookIds.add(entry.id);
    if (!HOOK_ID_PATTERN.test(entry.id)) {
      diagnostics.push({
        level: "error",
        code: "registry.invalid_id",
        hookId: entry.id,
        message: `Invalid hook ID: ${entry.id}`
      });
    }
    if (entry.timeoutMs < MIN_TIMEOUT_MS || entry.timeoutMs > MAX_TIMEOUT_MS) {
      diagnostics.push({
        level: "error",
        code: "registry.invalid_timeout",
        hookId: entry.id,
        message: `Invalid timeout for ${entry.id}`
      });
    }
  }
  return sortDiagnostics(diagnostics);
}
function selectRegistryEntries(entries, envelope, config) {
  const diagnostics = unknownConfiguredHookDiagnostics(entries, config);
  if (!config.enabled) {
    return {
      entries: [],
      diagnostics
    };
  }
  const enabledHookIds = new Set(config.enabledHooks);
  const disabledHookIds = new Set(config.disabledHooks);
  const selectedEntries = entries.filter((entry) => {
    if (!entry.events.includes(envelope.eventName)) {
      return false;
    }
    if (disabledHookIds.has(entry.id)) {
      return false;
    }
    return config.enableAllHooksByDefault || entry.defaultEnabled || enabledHookIds.has(entry.id);
  });
  return {
    entries: selectedEntries,
    diagnostics
  };
}
function unknownConfiguredHookDiagnostics(registry, config) {
  const knownHookIds = new Set(registry.map((entry) => entry.id));
  const configuredHookIds = /* @__PURE__ */ new Set([...config.enabledHooks, ...config.disabledHooks]);
  const diagnostics = [];
  for (const hookId of configuredHookIds) {
    if (!knownHookIds.has(hookId)) {
      diagnostics.push({
        level: "error",
        code: "registry.unknown_hook_id",
        hookId,
        message: `Configured hook ID is not implemented: ${hookId}`
      });
    }
  }
  return sortDiagnostics(diagnostics);
}

// dist/src/core/dispatcher.js
async function dispatchHookEvent(request) {
  const validationDiagnostics = validateRegistry(request.entries);
  if (validationDiagnostics.length > 0) {
    return safeDiagnosticOutput(validationDiagnostics);
  }
  const selection = selectRegistryEntries(request.entries, request.envelope, request.config);
  if (selection.diagnostics.length > 0) {
    return safeDiagnosticOutput(selection.diagnostics);
  }
  const results = await Promise.all(selection.entries.map((entry) => executeEntrySafely(entry, request.envelope, request.execute)));
  return combineHookResults(request.envelope.eventName, results);
}
async function executeEntrySafely(entry, envelope, execute) {
  try {
    return await withTimeout(execute(entry, envelope), entry.timeoutMs);
  } catch (error) {
    return failedHookResult(entry.id, envelope.eventName, getFailureReason(error));
  }
}
function safeDiagnosticOutput(diagnostics) {
  return {
    systemMessage: `hook-pack: ${diagnostics.map((diagnostic) => diagnostic.message).join("\n")}`
  };
}
function withTimeout(promise, timeoutMs) {
  return new Promise((resolve5, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise.then((value) => {
      clearTimeout(timeout);
      resolve5(value);
    }, (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
function failedHookResult(hookId, eventName, reason) {
  const message = `hook ${hookId} failed: ${reason}`;
  switch (eventName) {
    case "PreToolUse":
      return {
        hookId,
        permissionDecision: "deny",
        message
      };
    case "Stop":
    case "SubagentStop":
    case "PostToolUse":
      return {
        hookId,
        stopDecision: "block",
        message
      };
    default:
      return {
        hookId,
        additionalContext: message
      };
  }
}
function getFailureReason(error) {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }
  return "unknown error";
}

// dist/src/core/command-runner.js
import { spawn } from "node:child_process";
var KILL_AFTER_TIMEOUT_MS = 100;
function runCommand(request) {
  const [command, ...args] = request.command;
  if (command === void 0) {
    return Promise.resolve({
      exitCode: 1,
      stdout: "",
      stderr: "missing command",
      timedOut: false
    });
  }
  return new Promise((resolve5) => {
    let settled = false;
    let timedOut = false;
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let killTimer;
    const child = spawn(command, args, {
      cwd: request.cwd,
      env: { ...process.env, ...request.env },
      shell: false,
      stdio: ["pipe", "pipe", "pipe"]
    });
    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      killTimer = setTimeout(() => {
        child.kill("SIGKILL");
        finish(124);
      }, KILL_AFTER_TIMEOUT_MS);
    }, request.timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout = appendCapped(stdout, chunk, request.maxOutputBytes);
    });
    child.stderr.on("data", (chunk) => {
      stderr = appendCapped(stderr, chunk, request.maxOutputBytes);
    });
    child.stdin.on("error", (error) => {
      stderr = appendCapped(stderr, Buffer.from(error.message), request.maxOutputBytes);
    });
    child.on("error", (error) => {
      stderr = appendCapped(stderr, Buffer.from(error.message), request.maxOutputBytes);
      finish(1);
    });
    child.on("close", (code) => {
      finish(timedOut ? 124 : code ?? 1);
    });
    child.stdin.end(request.input);
    function finish(exitCode) {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutTimer);
      if (killTimer !== void 0) {
        clearTimeout(killTimer);
      }
      resolve5({
        exitCode,
        stdout: stdout.toString("utf8"),
        stderr: stderr.toString("utf8"),
        timedOut
      });
    }
  });
}
function appendCapped(existing, chunk, maxBytes) {
  if (existing.length >= maxBytes) {
    return existing;
  }
  const remainingBytes = maxBytes - existing.length;
  return Buffer.concat([existing, chunk.subarray(0, remainingBytes)]);
}

// dist/src/core/json.js
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function readStringField(record, fieldName) {
  const value = record[fieldName];
  return typeof value === "string" ? value : void 0;
}
function readRecordField(record, fieldName) {
  const value = record[fieldName];
  return isRecord(value) ? value : void 0;
}

// dist/src/core/entry-runner.js
var MAX_COMMAND_OUTPUT_BYTES = 64 * 1024;
async function executeRegistryEntry(request) {
  switch (request.entry.runner.kind) {
    case "internal": {
      const handler = request.resolveBuiltInHookHandler(request.entry.runner.handlerId);
      if (handler === void 0) {
        throw new Error(`missing built-in hook handler: ${request.entry.runner.handlerId}`);
      }
      return handler(request.envelope, request.runtimeContext);
    }
    case "command":
      return runRegisteredCommand(request.entry, request.envelope, request.entry.runner.command, request.runCommand ?? runCommand);
  }
}
async function runRegisteredCommand(entry, envelope, command, commandRunner) {
  const result = await commandRunner({
    command,
    cwd: envelope.cwd,
    input: JSON.stringify(envelope.raw),
    timeoutMs: entry.timeoutMs,
    maxOutputBytes: MAX_COMMAND_OUTPUT_BYTES,
    env: process.env
  });
  if (result.timedOut) {
    throw new Error(`command timed out after ${entry.timeoutMs}ms`);
  }
  if (result.exitCode !== 0) {
    const stderr = result.stderr.trim();
    throw new Error(stderr === "" ? `command exited ${result.exitCode}` : stderr);
  }
  if (Buffer.byteLength(result.stdout, "utf8") >= MAX_COMMAND_OUTPUT_BYTES) {
    throw new Error(`command output exceeded ${MAX_COMMAND_OUTPUT_BYTES} bytes`);
  }
  let parsedOutput;
  try {
    parsedOutput = JSON.parse(result.stdout);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown parse error";
    throw new Error(`command output must be valid JSON: ${reason}`);
  }
  return normalizeCommandHookResult(entry.id, parsedOutput);
}
function normalizeCommandHookResult(hookId, value) {
  if (!isRecord(value)) {
    throw new Error("command output must be a JSON object");
  }
  let normalized = {
    hookId: readHookId(value) ?? hookId
  };
  const permissionDecision = readPermissionDecision(value);
  if (permissionDecision !== void 0) {
    normalized = { ...normalized, permissionDecision };
  }
  const stopDecision = readStopDecision(value);
  if (stopDecision !== void 0) {
    normalized = { ...normalized, stopDecision };
  }
  const message = readOptionalStringProperty(value, "message");
  if (message !== void 0) {
    normalized = { ...normalized, message };
  }
  const additionalContext = readOptionalStringProperty(value, "additionalContext");
  if (additionalContext !== void 0) {
    normalized = { ...normalized, additionalContext };
  }
  const updatedInput = readUpdatedInput(value);
  if (updatedInput !== void 0) {
    normalized = { ...normalized, updatedInput };
  }
  return normalized;
}
function readHookId(value) {
  if (!("hookId" in value)) {
    return void 0;
  }
  const hookId = value.hookId;
  if (typeof hookId !== "string" || hookId.trim() === "") {
    throw new Error("hookId must be a non-empty string");
  }
  return hookId;
}
function readOptionalStringProperty(value, propertyName) {
  if (!(propertyName in value)) {
    return void 0;
  }
  const propertyValue = value[propertyName];
  if (typeof propertyValue !== "string") {
    throw new Error(`${propertyName} must be a string`);
  }
  return propertyValue;
}
function readPermissionDecision(value) {
  if (!("permissionDecision" in value)) {
    return void 0;
  }
  const permissionDecision = value.permissionDecision;
  if (permissionDecision === "allow" || permissionDecision === "ask" || permissionDecision === "deny") {
    return permissionDecision;
  }
  throw new Error("permissionDecision must be allow, ask, or deny");
}
function readStopDecision(value) {
  if (!("stopDecision" in value)) {
    return void 0;
  }
  const stopDecision = value.stopDecision;
  if (stopDecision === "pass" || stopDecision === "block") {
    return stopDecision;
  }
  throw new Error("stopDecision must be pass or block");
}
function readUpdatedInput(value) {
  if (!("updatedInput" in value)) {
    return void 0;
  }
  if (!isRecord(value.updatedInput)) {
    throw new Error("updatedInput must be a JSON object");
  }
  return value.updatedInput;
}

// dist/src/core/events.js
var SUPPORTED_EVENTS = [
  "SessionStart",
  "UserPromptSubmit",
  "UserPromptExpansion",
  "PreToolUse",
  "PermissionRequest",
  "PermissionDenied",
  "PostToolUse",
  "PostToolUseFailure",
  "PostToolBatch",
  "Notification",
  "SubagentStart",
  "SubagentStop",
  "TaskCreated",
  "TaskCompleted",
  "Stop",
  "StopFailure",
  "TeammateIdle",
  "InstructionsLoaded",
  "ConfigChange",
  "CwdChanged",
  "FileChanged",
  "WorktreeCreate",
  "WorktreeRemove",
  "PreCompact",
  "PostCompact",
  "Elicitation",
  "ElicitationResult",
  "SessionEnd"
];
var EVENT_DEFINITIONS = SUPPORTED_EVENTS.map((eventName) => ({
  name: eventName,
  matcherBehavior: getMatcherBehavior(eventName),
  outputCapabilities: getOutputCapabilities(eventName)
}));
var HookInputError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "HookInputError";
  }
};
function isSupportedEventName(value) {
  return typeof value === "string" && SUPPORTED_EVENTS.includes(value);
}
function normalizeHookInput(rawInput, expectedEventName) {
  if (!isRecord(rawInput)) {
    throw new HookInputError("Hook input must be an object");
  }
  const eventName = readStringField(rawInput, "hook_event_name");
  if (!isSupportedEventName(eventName)) {
    throw new HookInputError("Hook input must include supported hook_event_name");
  }
  if (expectedEventName !== void 0 && eventName !== expectedEventName) {
    throw new HookInputError(`Expected ${expectedEventName} hook input but received ${eventName}`);
  }
  const cwd = readStringField(rawInput, "cwd");
  if (cwd === void 0 || cwd.trim() === "") {
    throw new HookInputError("cwd must be a string");
  }
  const sessionId = readStringField(rawInput, "session_id");
  const toolName = readStringField(rawInput, "tool_name");
  if (requiresToolName(eventName) && (toolName === void 0 || toolName.trim() === "")) {
    throw new HookInputError(`${eventName} hook input must include non-empty tool_name`);
  }
  const toolInput = readRecordField(rawInput, "tool_input");
  const toolResponse = rawInput.tool_response ?? rawInput.tool_result;
  const userPrompt = readStringField(rawInput, "user_prompt") ?? readStringField(rawInput, "prompt");
  return {
    eventName,
    sessionId,
    cwd,
    raw: rawInput,
    toolName,
    toolInput,
    toolResponse,
    userPrompt
  };
}
function requiresToolName(eventName) {
  return getMatcherBehavior(eventName) === "tool";
}
function getMatcherBehavior(eventName) {
  switch (eventName) {
    case "PreToolUse":
    case "PostToolUse":
    case "PostToolUseFailure":
    case "PermissionRequest":
    case "PermissionDenied":
      return "tool";
    default:
      return "event-specific";
  }
}
function getOutputCapabilities(eventName) {
  switch (eventName) {
    case "PreToolUse":
      return ["permission", "context"];
    case "Stop":
    case "SubagentStop":
      return ["block", "context"];
    case "UserPromptSubmit":
    case "SessionStart":
    case "PostToolUse":
    case "PreCompact":
      return ["context"];
    case "Notification":
      return ["notification"];
    default:
      return [];
  }
}

// dist/src/core/runtime-context.js
var DEFAULT_USER_CONFIG = {
  maxContextChars: 2e4,
  includeUserRules: false
};
function resolveRuntimeContext(cwd, env = process.env, now = Date.now, userConfigOverride) {
  return {
    cwd,
    pluginDataDir: cleanOptionalPath(env.CLAUDE_PLUGIN_DATA),
    debug: env.HOOK_PACK_DEBUG === "1" || env.HOOK_PACK_DEBUG === "true",
    env,
    userConfig: { ...DEFAULT_USER_CONFIG, ...userConfigOverride },
    now
  };
}
function cleanOptionalPath(value) {
  if (value === void 0) {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed === "" ? void 0 : trimmed;
}

// dist/src/hooks/comment-checker/index.js
import { createHash as createHash3 } from "node:crypto";
import { existsSync as existsSync7, readFileSync as readFileSync4 } from "node:fs";

// dist/src/hooks/shared/path.js
import { existsSync as existsSync2, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join as join2, relative, resolve } from "node:path";
var TOOL_PATH_KEYS = ["file_path", "filePath", "path"];
function extractToolPath(toolInput) {
  if (toolInput === void 0) {
    return void 0;
  }
  for (const key of TOOL_PATH_KEYS) {
    if (Object.hasOwn(toolInput, key)) {
      const value = toolInput[key];
      if (typeof value !== "string") {
        return void 0;
      }
      const trimmed = value.trim();
      return trimmed === "" ? void 0 : value;
    }
  }
  return void 0;
}
function resolveToolPath(cwd, candidate) {
  return resolve(cwd, candidate);
}
function isPathInsideDirectory(parent, child) {
  const relativePath = relative(resolve(parent), resolve(child));
  return relativePath === "" || !relativePath.startsWith("..") && !isAbsolute(relativePath);
}
function canonicalizeExistingOrParent(target) {
  if (existsSync2(target)) {
    return realpathSync(target);
  }
  try {
    return join2(realpathSync(dirname(target)), basename(target));
  } catch {
    return resolve(target);
  }
}

// dist/src/hooks/shared/tool-output.js
function isSuccessfulToolResponse(toolResponse) {
  if (typeof toolResponse === "string") {
    const normalized = toolResponse.trim().toLowerCase();
    return !(normalized.startsWith("error") || normalized.includes("failed to") || normalized.includes("could not"));
  }
  if (isRecord2(toolResponse)) {
    if (Object.hasOwn(toolResponse, "error") || Object.hasOwn(toolResponse, "tool_use_error")) {
      return false;
    }
    if (toolResponse.is_error === true || toolResponse.success === false || toolResponse.status === "error") {
      return false;
    }
  }
  return true;
}
function extractPostToolPath(toolInput, toolResponse, cwd) {
  const inputPath = extractToolPath(toolInput);
  if (inputPath !== void 0) {
    return resolveToolPath(cwd, inputPath);
  }
  if (!isRecord2(toolResponse) || !isRecord2(toolResponse.metadata)) {
    return void 0;
  }
  const metadataPath = readString(toolResponse.metadata.filePath) ?? readString(toolResponse.metadata.file_path);
  return metadataPath === void 0 ? void 0 : resolveToolPath(cwd, metadataPath);
}
function readString(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed === "" ? void 0 : value;
}
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}

// dist/src/hooks/comment-checker/binary-resolver.js
import { constants, existsSync as existsSync4 } from "node:fs";
import { access, lstat } from "node:fs/promises";
import { delimiter, join as join4 } from "node:path";

// dist/src/hooks/comment-checker/lock-store.js
import { randomUUID } from "node:crypto";
import { existsSync as existsSync3, mkdirSync, readdirSync, readFileSync as readFileSync2, rmSync, writeFileSync } from "node:fs";
import { join as join3 } from "node:path";
var DEFAULT_STALE_LOCK_MS = 3e4;
var LOCK_ATTEMPTS = 5;
var LOCK_RETRY_MS = 25;
function createCommentCheckerLockStore(options) {
  return {
    withLock: async (name, run) => {
      const lock = acquireLock(options, name);
      if (lock === null) {
        return null;
      }
      try {
        return await run();
      } catch {
        return null;
      } finally {
        releaseLock(lock);
      }
    }
  };
}
function cleanupStaleCommentCheckerLocks(options) {
  if (options.pluginDataDir === void 0) {
    return;
  }
  const locksDir = join3(options.pluginDataDir, "comment-checker", "locks");
  if (!existsSync3(locksDir)) {
    return;
  }
  try {
    for (const entry of readdirSync(locksDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.endsWith(".lock")) {
        continue;
      }
      const lockDir = join3(locksDir, entry.name);
      if (isStaleLock(lockDir, options.now(), options.staleLockMs ?? DEFAULT_STALE_LOCK_MS)) {
        removePath(lockDir);
      }
    }
  } catch {
  }
}
function acquireLock(options, name) {
  if (options.pluginDataDir === void 0) {
    return null;
  }
  const lockDir = join3(options.pluginDataDir, "comment-checker", "locks", `${sanitizeLockName(name)}.lock`);
  try {
    mkdirSync(join3(options.pluginDataDir, "comment-checker", "locks"), { recursive: true });
  } catch {
    return null;
  }
  for (let attempt = 0; attempt < LOCK_ATTEMPTS; attempt++) {
    try {
      const token = randomUUID();
      mkdirSync(lockDir);
      writeFileSync(join3(lockDir, "owner.json"), `${JSON.stringify({ pid: process.pid, createdAt: options.now(), token })}
`, "utf8");
      return { dir: lockDir, token };
    } catch (error) {
      if (!isErrorWithCode(error) || error.code !== "EEXIST") {
        return null;
      }
      if (isStaleLock(lockDir, options.now(), options.staleLockMs ?? DEFAULT_STALE_LOCK_MS)) {
        removePath(lockDir);
        continue;
      }
      sleep(LOCK_RETRY_MS);
    }
  }
  return null;
}
function releaseLock(lock) {
  try {
    const owner = readOwner(lock.dir);
    if (owner?.token === lock.token) {
      rmSync(lock.dir, { recursive: true, force: true });
    }
  } catch {
  }
}
function isStaleLock(lockDir, now, staleLockMs) {
  const owner = readOwner(lockDir);
  return owner !== void 0 && now - owner.createdAt > staleLockMs;
}
function readOwner(lockDir) {
  try {
    const parsed = JSON.parse(readFileSync2(join3(lockDir, "owner.json"), "utf8"));
    if (!isRecord3(parsed) || typeof parsed.pid !== "number" || typeof parsed.createdAt !== "number" || typeof parsed.token !== "string") {
      return void 0;
    }
    return { pid: parsed.pid, createdAt: parsed.createdAt, token: parsed.token };
  } catch {
    return void 0;
  }
}
function sanitizeLockName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-") || "lock";
}
function removePath(path) {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch {
  }
}
function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}
function isRecord3(value) {
  return typeof value === "object" && value !== null;
}
function isErrorWithCode(value) {
  return typeof value === "object" && value !== null && "code" in value && typeof value.code === "string";
}

// dist/src/hooks/comment-checker/binary-resolver.js
async function resolveCommentCheckerBinary(options) {
  const envCommand = cleanOptionalPath2(options.env.COMMENT_CHECKER_COMMAND);
  if (envCommand !== void 0 && await isExecutable(envCommand)) {
    return { path: envCommand, source: "env" };
  }
  const cachedBinary = options.pluginDataDir === void 0 ? void 0 : getCachedCommentCheckerBinaryPath(options.pluginDataDir);
  if (cachedBinary !== void 0 && await isSafeCachedExecutable(cachedBinary)) {
    return { path: cachedBinary, source: "plugin-data" };
  }
  const pathBinary = await findOnPath(options.env.PATH);
  if (pathBinary !== null) {
    return { path: pathBinary, source: "path" };
  }
  if (options.pluginDataDir === void 0 || cachedBinary === void 0 || options.signal.aborted) {
    return null;
  }
  const lockStore = createCommentCheckerLockStore({ pluginDataDir: options.pluginDataDir, now: options.now ?? Date.now });
  const downloaded = await lockStore.withLock("download", async () => {
    if (await isSafeCachedExecutable(cachedBinary)) {
      return cachedBinary;
    }
    return options.download(options.signal);
  });
  if (downloaded !== null && downloaded !== void 0 && await isSafeCachedExecutable(downloaded)) {
    return { path: downloaded, source: "plugin-data" };
  }
  if (downloaded === null && await waitForCachedBinary(cachedBinary, options.signal)) {
    return { path: cachedBinary, source: "plugin-data" };
  }
  if (await isSafeCachedExecutable(cachedBinary)) {
    return { path: cachedBinary, source: "plugin-data" };
  }
  return null;
}
function getCachedCommentCheckerBinaryPath(pluginDataDir, platform = process.platform) {
  const binaryName = platform === "win32" ? "comment-checker.exe" : "comment-checker";
  return join4(pluginDataDir, "comment-checker", "bin", binaryName);
}
async function findOnPath(pathValue) {
  if (pathValue === void 0 || pathValue.trim() === "") {
    return null;
  }
  for (const dir of pathValue.split(delimiter)) {
    if (dir.trim() === "") {
      continue;
    }
    const candidate = join4(dir, process.platform === "win32" ? "comment-checker.exe" : "comment-checker");
    if (existsSync4(candidate) && await isExecutable(candidate)) {
      return candidate;
    }
  }
  return null;
}
async function isExecutable(path) {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
async function isSafeCachedExecutable(path) {
  try {
    const stats = await lstat(path);
    return stats.isFile() && !stats.isSymbolicLink() && stats.nlink <= 1 && await isExecutable(path);
  } catch {
    return false;
  }
}
async function waitForCachedBinary(path, signal) {
  for (let attempt = 0; attempt < 10; attempt++) {
    if (signal.aborted) {
      return false;
    }
    if (await isSafeCachedExecutable(path)) {
      return true;
    }
    await new Promise((resolve5) => {
      setTimeout(resolve5, 25);
    });
  }
  return false;
}
function cleanOptionalPath2(value) {
  if (value === void 0) {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed === "" ? void 0 : trimmed;
}

// dist/src/hooks/comment-checker/downloader.js
import { createHash } from "node:crypto";
import { constants as constants2, existsSync as existsSync5, mkdirSync as mkdirSync2, rmSync as rmSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { access as access2, chmod, lstat as lstat2, mkdtemp, open, readFile, rename, rm } from "node:fs/promises";
import { basename as basename2, dirname as dirname2, isAbsolute as isAbsolute2, join as join5, normalize, relative as relative2, resolve as resolve2, sep } from "node:path";

// node_modules/tar/dist/esm/index.min.js
import Kr from "events";
import I from "fs";
import { EventEmitter as Ti } from "node:events";
import Ns from "node:stream";
import { StringDecoder as Mr } from "node:string_decoder";
import nr from "node:path";
import Vt from "node:fs";
import { dirname as xn, parse as Ln } from "path";
import { EventEmitter as _n } from "events";
import Mi from "assert";
import { Buffer as gt } from "buffer";
import * as ks from "zlib";
import qr from "zlib";
import { posix as Zt } from "node:path";
import { basename as wn } from "node:path";
import fi from "fs";
import $ from "fs";
import $s from "path";
import { win32 as In } from "node:path";
import sr from "path";
import Cr from "node:fs";
import so from "node:assert";
import { randomBytes as Ir } from "node:crypto";
import u from "node:fs";
import R from "node:path";
import cr from "fs";
import mi from "node:fs";
import Ee from "node:path";
import k from "node:fs";
import jn from "node:fs/promises";
import pi from "node:path";
import { join as br } from "node:path";
import v from "node:fs";
import Fr from "node:path";
var kr = Object.defineProperty;
var vr = (s3, t) => {
  for (var e in t) kr(s3, e, { get: t[e], enumerable: true });
};
var Os = typeof process == "object" && process ? process : { stdout: null, stderr: null };
var Br = (s3) => !!s3 && typeof s3 == "object" && (s3 instanceof D || s3 instanceof Ns || Pr(s3) || zr(s3));
var Pr = (s3) => !!s3 && typeof s3 == "object" && s3 instanceof Ti && typeof s3.pipe == "function" && s3.pipe !== Ns.Writable.prototype.pipe;
var zr = (s3) => !!s3 && typeof s3 == "object" && s3 instanceof Ti && typeof s3.write == "function" && typeof s3.end == "function";
var q = Symbol("EOF");
var j = Symbol("maybeEmitEnd");
var rt = Symbol("emittedEnd");
var Le = Symbol("emittingEnd");
var jt = Symbol("emittedError");
var Ne = Symbol("closed");
var Ts = Symbol("read");
var Ae = Symbol("flush");
var xs = Symbol("flushChunk");
var z = Symbol("encoding");
var Mt = Symbol("decoder");
var b = Symbol("flowing");
var Qt = Symbol("paused");
var Bt = Symbol("resume");
var _ = Symbol("buffer");
var A = Symbol("pipes");
var g = Symbol("bufferLength");
var yi = Symbol("bufferPush");
var De = Symbol("bufferShift");
var L = Symbol("objectMode");
var w = Symbol("destroyed");
var Ri = Symbol("error");
var bi = Symbol("emitData");
var Ls = Symbol("emitEnd");
var _i = Symbol("emitEnd2");
var Z = Symbol("async");
var gi = Symbol("abort");
var Ie = Symbol("aborted");
var Jt = Symbol("signal");
var yt = Symbol("dataListeners");
var C = Symbol("discarded");
var te = (s3) => Promise.resolve().then(s3);
var Ur = (s3) => s3();
var Hr = (s3) => s3 === "end" || s3 === "finish" || s3 === "prefinish";
var Wr = (s3) => s3 instanceof ArrayBuffer || !!s3 && typeof s3 == "object" && s3.constructor && s3.constructor.name === "ArrayBuffer" && s3.byteLength >= 0;
var Gr = (s3) => !Buffer.isBuffer(s3) && ArrayBuffer.isView(s3);
var Ce = class {
  src;
  dest;
  opts;
  ondrain;
  constructor(t, e, i) {
    this.src = t, this.dest = e, this.opts = i, this.ondrain = () => t[Bt](), this.dest.on("drain", this.ondrain);
  }
  unpipe() {
    this.dest.removeListener("drain", this.ondrain);
  }
  proxyErrors(t) {
  }
  end() {
    this.unpipe(), this.opts.end && this.dest.end();
  }
};
var Oi = class extends Ce {
  unpipe() {
    this.src.removeListener("error", this.proxyErrors), super.unpipe();
  }
  constructor(t, e, i) {
    super(t, e, i), this.proxyErrors = (r) => this.dest.emit("error", r), t.on("error", this.proxyErrors);
  }
};
var Zr = (s3) => !!s3.objectMode;
var Yr = (s3) => !s3.objectMode && !!s3.encoding && s3.encoding !== "buffer";
var D = class extends Ti {
  [b] = false;
  [Qt] = false;
  [A] = [];
  [_] = [];
  [L];
  [z];
  [Z];
  [Mt];
  [q] = false;
  [rt] = false;
  [Le] = false;
  [Ne] = false;
  [jt] = null;
  [g] = 0;
  [w] = false;
  [Jt];
  [Ie] = false;
  [yt] = 0;
  [C] = false;
  writable = true;
  readable = true;
  constructor(...t) {
    let e = t[0] || {};
    if (super(), e.objectMode && typeof e.encoding == "string") throw new TypeError("Encoding and objectMode may not be used together");
    Zr(e) ? (this[L] = true, this[z] = null) : Yr(e) ? (this[z] = e.encoding, this[L] = false) : (this[L] = false, this[z] = null), this[Z] = !!e.async, this[Mt] = this[z] ? new Mr(this[z]) : null, e && e.debugExposeBuffer === true && Object.defineProperty(this, "buffer", { get: () => this[_] }), e && e.debugExposePipes === true && Object.defineProperty(this, "pipes", { get: () => this[A] });
    let { signal: i } = e;
    i && (this[Jt] = i, i.aborted ? this[gi]() : i.addEventListener("abort", () => this[gi]()));
  }
  get bufferLength() {
    return this[g];
  }
  get encoding() {
    return this[z];
  }
  set encoding(t) {
    throw new Error("Encoding must be set at instantiation time");
  }
  setEncoding(t) {
    throw new Error("Encoding must be set at instantiation time");
  }
  get objectMode() {
    return this[L];
  }
  set objectMode(t) {
    throw new Error("objectMode must be set at instantiation time");
  }
  get async() {
    return this[Z];
  }
  set async(t) {
    this[Z] = this[Z] || !!t;
  }
  [gi]() {
    this[Ie] = true, this.emit("abort", this[Jt]?.reason), this.destroy(this[Jt]?.reason);
  }
  get aborted() {
    return this[Ie];
  }
  set aborted(t) {
  }
  write(t, e, i) {
    if (this[Ie]) return false;
    if (this[q]) throw new Error("write after end");
    if (this[w]) return this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" })), true;
    typeof e == "function" && (i = e, e = "utf8"), e || (e = "utf8");
    let r = this[Z] ? te : Ur;
    if (!this[L] && !Buffer.isBuffer(t)) {
      if (Gr(t)) t = Buffer.from(t.buffer, t.byteOffset, t.byteLength);
      else if (Wr(t)) t = Buffer.from(t);
      else if (typeof t != "string") throw new Error("Non-contiguous data written to non-objectMode stream");
    }
    return this[L] ? (this[b] && this[g] !== 0 && this[Ae](true), this[b] ? this.emit("data", t) : this[yi](t), this[g] !== 0 && this.emit("readable"), i && r(i), this[b]) : t.length ? (typeof t == "string" && !(e === this[z] && !this[Mt]?.lastNeed) && (t = Buffer.from(t, e)), Buffer.isBuffer(t) && this[z] && (t = this[Mt].write(t)), this[b] && this[g] !== 0 && this[Ae](true), this[b] ? this.emit("data", t) : this[yi](t), this[g] !== 0 && this.emit("readable"), i && r(i), this[b]) : (this[g] !== 0 && this.emit("readable"), i && r(i), this[b]);
  }
  read(t) {
    if (this[w]) return null;
    if (this[C] = false, this[g] === 0 || t === 0 || t && t > this[g]) return this[j](), null;
    this[L] && (t = null), this[_].length > 1 && !this[L] && (this[_] = [this[z] ? this[_].join("") : Buffer.concat(this[_], this[g])]);
    let e = this[Ts](t || null, this[_][0]);
    return this[j](), e;
  }
  [Ts](t, e) {
    if (this[L]) this[De]();
    else {
      let i = e;
      t === i.length || t === null ? this[De]() : typeof i == "string" ? (this[_][0] = i.slice(t), e = i.slice(0, t), this[g] -= t) : (this[_][0] = i.subarray(t), e = i.subarray(0, t), this[g] -= t);
    }
    return this.emit("data", e), !this[_].length && !this[q] && this.emit("drain"), e;
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, t = void 0), typeof e == "function" && (i = e, e = "utf8"), t !== void 0 && this.write(t, e), i && this.once("end", i), this[q] = true, this.writable = false, (this[b] || !this[Qt]) && this[j](), this;
  }
  [Bt]() {
    this[w] || (!this[yt] && !this[A].length && (this[C] = true), this[Qt] = false, this[b] = true, this.emit("resume"), this[_].length ? this[Ae]() : this[q] ? this[j]() : this.emit("drain"));
  }
  resume() {
    return this[Bt]();
  }
  pause() {
    this[b] = false, this[Qt] = true, this[C] = false;
  }
  get destroyed() {
    return this[w];
  }
  get flowing() {
    return this[b];
  }
  get paused() {
    return this[Qt];
  }
  [yi](t) {
    this[L] ? this[g] += 1 : this[g] += t.length, this[_].push(t);
  }
  [De]() {
    return this[L] ? this[g] -= 1 : this[g] -= this[_][0].length, this[_].shift();
  }
  [Ae](t = false) {
    do
      ;
    while (this[xs](this[De]()) && this[_].length);
    !t && !this[_].length && !this[q] && this.emit("drain");
  }
  [xs](t) {
    return this.emit("data", t), this[b];
  }
  pipe(t, e) {
    if (this[w]) return t;
    this[C] = false;
    let i = this[rt];
    return e = e || {}, t === Os.stdout || t === Os.stderr ? e.end = false : e.end = e.end !== false, e.proxyErrors = !!e.proxyErrors, i ? e.end && t.end() : (this[A].push(e.proxyErrors ? new Oi(this, t, e) : new Ce(this, t, e)), this[Z] ? te(() => this[Bt]()) : this[Bt]()), t;
  }
  unpipe(t) {
    let e = this[A].find((i) => i.dest === t);
    e && (this[A].length === 1 ? (this[b] && this[yt] === 0 && (this[b] = false), this[A] = []) : this[A].splice(this[A].indexOf(e), 1), e.unpipe());
  }
  addListener(t, e) {
    return this.on(t, e);
  }
  on(t, e) {
    let i = super.on(t, e);
    if (t === "data") this[C] = false, this[yt]++, !this[A].length && !this[b] && this[Bt]();
    else if (t === "readable" && this[g] !== 0) super.emit("readable");
    else if (Hr(t) && this[rt]) super.emit(t), this.removeAllListeners(t);
    else if (t === "error" && this[jt]) {
      let r = e;
      this[Z] ? te(() => r.call(this, this[jt])) : r.call(this, this[jt]);
    }
    return i;
  }
  removeListener(t, e) {
    return this.off(t, e);
  }
  off(t, e) {
    let i = super.off(t, e);
    return t === "data" && (this[yt] = this.listeners("data").length, this[yt] === 0 && !this[C] && !this[A].length && (this[b] = false)), i;
  }
  removeAllListeners(t) {
    let e = super.removeAllListeners(t);
    return (t === "data" || t === void 0) && (this[yt] = 0, !this[C] && !this[A].length && (this[b] = false)), e;
  }
  get emittedEnd() {
    return this[rt];
  }
  [j]() {
    !this[Le] && !this[rt] && !this[w] && this[_].length === 0 && this[q] && (this[Le] = true, this.emit("end"), this.emit("prefinish"), this.emit("finish"), this[Ne] && this.emit("close"), this[Le] = false);
  }
  emit(t, ...e) {
    let i = e[0];
    if (t !== "error" && t !== "close" && t !== w && this[w]) return false;
    if (t === "data") return !this[L] && !i ? false : this[Z] ? (te(() => this[bi](i)), true) : this[bi](i);
    if (t === "end") return this[Ls]();
    if (t === "close") {
      if (this[Ne] = true, !this[rt] && !this[w]) return false;
      let n = super.emit("close");
      return this.removeAllListeners("close"), n;
    } else if (t === "error") {
      this[jt] = i, super.emit(Ri, i);
      let n = !this[Jt] || this.listeners("error").length ? super.emit("error", i) : false;
      return this[j](), n;
    } else if (t === "resume") {
      let n = super.emit("resume");
      return this[j](), n;
    } else if (t === "finish" || t === "prefinish") {
      let n = super.emit(t);
      return this.removeAllListeners(t), n;
    }
    let r = super.emit(t, ...e);
    return this[j](), r;
  }
  [bi](t) {
    for (let i of this[A]) i.dest.write(t) === false && this.pause();
    let e = this[C] ? false : super.emit("data", t);
    return this[j](), e;
  }
  [Ls]() {
    return this[rt] ? false : (this[rt] = true, this.readable = false, this[Z] ? (te(() => this[_i]()), true) : this[_i]());
  }
  [_i]() {
    if (this[Mt]) {
      let e = this[Mt].end();
      if (e) {
        for (let i of this[A]) i.dest.write(e);
        this[C] || super.emit("data", e);
      }
    }
    for (let e of this[A]) e.end();
    let t = super.emit("end");
    return this.removeAllListeners("end"), t;
  }
  async collect() {
    let t = Object.assign([], { dataLength: 0 });
    this[L] || (t.dataLength = 0);
    let e = this.promise();
    return this.on("data", (i) => {
      t.push(i), this[L] || (t.dataLength += i.length);
    }), await e, t;
  }
  async concat() {
    if (this[L]) throw new Error("cannot concat in objectMode");
    let t = await this.collect();
    return this[z] ? t.join("") : Buffer.concat(t, t.dataLength);
  }
  async promise() {
    return new Promise((t, e) => {
      this.on(w, () => e(new Error("stream destroyed"))), this.on("error", (i) => e(i)), this.on("end", () => t());
    });
  }
  [Symbol.asyncIterator]() {
    this[C] = false;
    let t = false, e = async () => (this.pause(), t = true, { value: void 0, done: true });
    return { next: () => {
      if (t) return e();
      let r = this.read();
      if (r !== null) return Promise.resolve({ done: false, value: r });
      if (this[q]) return e();
      let n, o, h = (d) => {
        this.off("data", a), this.off("end", l), this.off(w, c), e(), o(d);
      }, a = (d) => {
        this.off("error", h), this.off("end", l), this.off(w, c), this.pause(), n({ value: d, done: !!this[q] });
      }, l = () => {
        this.off("error", h), this.off("data", a), this.off(w, c), e(), n({ done: true, value: void 0 });
      }, c = () => h(new Error("stream destroyed"));
      return new Promise((d, S) => {
        o = S, n = d, this.once(w, c), this.once("error", h), this.once("end", l), this.once("data", a);
      });
    }, throw: e, return: e, [Symbol.asyncIterator]() {
      return this;
    }, [Symbol.asyncDispose]: async () => {
    } };
  }
  [Symbol.iterator]() {
    this[C] = false;
    let t = false, e = () => (this.pause(), this.off(Ri, e), this.off(w, e), this.off("end", e), t = true, { done: true, value: void 0 }), i = () => {
      if (t) return e();
      let r = this.read();
      return r === null ? e() : { done: false, value: r };
    };
    return this.once("end", e), this.once(Ri, e), this.once(w, e), { next: i, throw: e, return: e, [Symbol.iterator]() {
      return this;
    }, [Symbol.dispose]: () => {
    } };
  }
  destroy(t) {
    if (this[w]) return t ? this.emit("error", t) : this.emit(w), this;
    this[w] = true, this[C] = true, this[_].length = 0, this[g] = 0;
    let e = this;
    return typeof e.close == "function" && !this[Ne] && e.close(), t ? this.emit("error", t) : this.emit(w), this;
  }
  static get isStream() {
    return Br;
  }
};
var Vr = I.writev;
var ot = Symbol("_autoClose");
var H = Symbol("_close");
var ee = Symbol("_ended");
var m = Symbol("_fd");
var xi = Symbol("_finished");
var J = Symbol("_flags");
var Li = Symbol("_flush");
var Ii = Symbol("_handleChunk");
var Ci = Symbol("_makeBuf");
var se = Symbol("_mode");
var Fe = Symbol("_needDrain");
var Ut = Symbol("_onerror");
var Ht = Symbol("_onopen");
var Ni = Symbol("_onread");
var Pt = Symbol("_onwrite");
var ht = Symbol("_open");
var U = Symbol("_path");
var nt = Symbol("_pos");
var Y = Symbol("_queue");
var zt = Symbol("_read");
var Ai = Symbol("_readSize");
var Q = Symbol("_reading");
var ie = Symbol("_remain");
var Di = Symbol("_size");
var ke = Symbol("_write");
var Rt = Symbol("_writing");
var ve = Symbol("_defaultFlag");
var bt = Symbol("_errored");
var _t = class extends D {
  [bt] = false;
  [m];
  [U];
  [Ai];
  [Q] = false;
  [Di];
  [ie];
  [ot];
  constructor(t, e) {
    if (e = e || {}, super(e), this.readable = true, this.writable = false, typeof t != "string") throw new TypeError("path must be a string");
    this[bt] = false, this[m] = typeof e.fd == "number" ? e.fd : void 0, this[U] = t, this[Ai] = e.readSize || 16 * 1024 * 1024, this[Q] = false, this[Di] = typeof e.size == "number" ? e.size : 1 / 0, this[ie] = this[Di], this[ot] = typeof e.autoClose == "boolean" ? e.autoClose : true, typeof this[m] == "number" ? this[zt]() : this[ht]();
  }
  get fd() {
    return this[m];
  }
  get path() {
    return this[U];
  }
  write() {
    throw new TypeError("this is a readable stream");
  }
  end() {
    throw new TypeError("this is a readable stream");
  }
  [ht]() {
    I.open(this[U], "r", (t, e) => this[Ht](t, e));
  }
  [Ht](t, e) {
    t ? this[Ut](t) : (this[m] = e, this.emit("open", e), this[zt]());
  }
  [Ci]() {
    return Buffer.allocUnsafe(Math.min(this[Ai], this[ie]));
  }
  [zt]() {
    if (!this[Q]) {
      this[Q] = true;
      let t = this[Ci]();
      if (t.length === 0) return process.nextTick(() => this[Ni](null, 0, t));
      I.read(this[m], t, 0, t.length, null, (e, i, r) => this[Ni](e, i, r));
    }
  }
  [Ni](t, e, i) {
    this[Q] = false, t ? this[Ut](t) : this[Ii](e, i) && this[zt]();
  }
  [H]() {
    if (this[ot] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = void 0, I.close(t, (e) => e ? this.emit("error", e) : this.emit("close"));
    }
  }
  [Ut](t) {
    this[Q] = true, this[H](), this.emit("error", t);
  }
  [Ii](t, e) {
    let i = false;
    return this[ie] -= t, t > 0 && (i = super.write(t < e.length ? e.subarray(0, t) : e)), (t === 0 || this[ie] <= 0) && (i = false, this[H](), super.end()), i;
  }
  emit(t, ...e) {
    switch (t) {
      case "prefinish":
      case "finish":
        return false;
      case "drain":
        return typeof this[m] == "number" && this[zt](), false;
      case "error":
        return this[bt] ? false : (this[bt] = true, super.emit(t, ...e));
      default:
        return super.emit(t, ...e);
    }
  }
};
var Me = class extends _t {
  [ht]() {
    let t = true;
    try {
      this[Ht](null, I.openSync(this[U], "r")), t = false;
    } finally {
      t && this[H]();
    }
  }
  [zt]() {
    let t = true;
    try {
      if (!this[Q]) {
        this[Q] = true;
        do {
          let e = this[Ci](), i = e.length === 0 ? 0 : I.readSync(this[m], e, 0, e.length, null);
          if (!this[Ii](i, e)) break;
        } while (true);
        this[Q] = false;
      }
      t = false;
    } finally {
      t && this[H]();
    }
  }
  [H]() {
    if (this[ot] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = void 0, I.closeSync(t), this.emit("close");
    }
  }
};
var tt = class extends Kr {
  readable = false;
  writable = true;
  [bt] = false;
  [Rt] = false;
  [ee] = false;
  [Y] = [];
  [Fe] = false;
  [U];
  [se];
  [ot];
  [m];
  [ve];
  [J];
  [xi] = false;
  [nt];
  constructor(t, e) {
    e = e || {}, super(e), this[U] = t, this[m] = typeof e.fd == "number" ? e.fd : void 0, this[se] = e.mode === void 0 ? 438 : e.mode, this[nt] = typeof e.start == "number" ? e.start : void 0, this[ot] = typeof e.autoClose == "boolean" ? e.autoClose : true;
    let i = this[nt] !== void 0 ? "r+" : "w";
    this[ve] = e.flags === void 0, this[J] = e.flags === void 0 ? i : e.flags, this[m] === void 0 && this[ht]();
  }
  emit(t, ...e) {
    if (t === "error") {
      if (this[bt]) return false;
      this[bt] = true;
    }
    return super.emit(t, ...e);
  }
  get fd() {
    return this[m];
  }
  get path() {
    return this[U];
  }
  [Ut](t) {
    this[H](), this[Rt] = true, this.emit("error", t);
  }
  [ht]() {
    I.open(this[U], this[J], this[se], (t, e) => this[Ht](t, e));
  }
  [Ht](t, e) {
    this[ve] && this[J] === "r+" && t && t.code === "ENOENT" ? (this[J] = "w", this[ht]()) : t ? this[Ut](t) : (this[m] = e, this.emit("open", e), this[Rt] || this[Li]());
  }
  end(t, e) {
    return t && this.write(t, e), this[ee] = true, !this[Rt] && !this[Y].length && typeof this[m] == "number" && this[Pt](null, 0), this;
  }
  write(t, e) {
    return typeof t == "string" && (t = Buffer.from(t, e)), this[ee] ? (this.emit("error", new Error("write() after end()")), false) : this[m] === void 0 || this[Rt] || this[Y].length ? (this[Y].push(t), this[Fe] = true, false) : (this[Rt] = true, this[ke](t), true);
  }
  [ke](t) {
    I.write(this[m], t, 0, t.length, this[nt], (e, i) => this[Pt](e, i));
  }
  [Pt](t, e) {
    t ? this[Ut](t) : (this[nt] !== void 0 && typeof e == "number" && (this[nt] += e), this[Y].length ? this[Li]() : (this[Rt] = false, this[ee] && !this[xi] ? (this[xi] = true, this[H](), this.emit("finish")) : this[Fe] && (this[Fe] = false, this.emit("drain"))));
  }
  [Li]() {
    if (this[Y].length === 0) this[ee] && this[Pt](null, 0);
    else if (this[Y].length === 1) this[ke](this[Y].pop());
    else {
      let t = this[Y];
      this[Y] = [], Vr(this[m], t, this[nt], (e, i) => this[Pt](e, i));
    }
  }
  [H]() {
    if (this[ot] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = void 0, I.close(t, (e) => e ? this.emit("error", e) : this.emit("close"));
    }
  }
};
var Wt = class extends tt {
  [ht]() {
    let t;
    if (this[ve] && this[J] === "r+") try {
      t = I.openSync(this[U], this[J], this[se]);
    } catch (e) {
      if (e?.code === "ENOENT") return this[J] = "w", this[ht]();
      throw e;
    }
    else t = I.openSync(this[U], this[J], this[se]);
    this[Ht](null, t);
  }
  [H]() {
    if (this[ot] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = void 0, I.closeSync(t), this.emit("close");
    }
  }
  [ke](t) {
    let e = true;
    try {
      this[Pt](null, I.writeSync(this[m], t, 0, t.length, this[nt])), e = false;
    } finally {
      if (e) try {
        this[H]();
      } catch {
      }
    }
  }
};
var $r = /* @__PURE__ */ new Map([["C", "cwd"], ["f", "file"], ["z", "gzip"], ["P", "preservePaths"], ["U", "unlink"], ["strip-components", "strip"], ["stripComponents", "strip"], ["keep-newer", "newer"], ["keepNewer", "newer"], ["keep-newer-files", "newer"], ["keepNewerFiles", "newer"], ["k", "keep"], ["keep-existing", "keep"], ["keepExisting", "keep"], ["m", "noMtime"], ["no-mtime", "noMtime"], ["p", "preserveOwner"], ["L", "follow"], ["h", "follow"], ["onentry", "onReadEntry"]]);
var As = (s3) => !!s3.sync && !!s3.file;
var Ds = (s3) => !s3.sync && !!s3.file;
var Is = (s3) => !!s3.sync && !s3.file;
var Cs = (s3) => !s3.sync && !s3.file;
var Fs = (s3) => !!s3.file;
var Xr = (s3) => {
  let t = $r.get(s3);
  return t || s3;
};
var re = (s3 = {}) => {
  if (!s3) return {};
  let t = {};
  for (let [e, i] of Object.entries(s3)) {
    let r = Xr(e);
    t[r] = i;
  }
  return t.chmod === void 0 && t.noChmod === false && (t.chmod = true), delete t.noChmod, t;
};
var K = (s3, t, e, i, r) => Object.assign((n = [], o, h) => {
  Array.isArray(n) && (o = n, n = {}), typeof o == "function" && (h = o, o = void 0), o = o ? Array.from(o) : [];
  let a = re(n);
  if (r?.(a, o), As(a)) {
    if (typeof h == "function") throw new TypeError("callback not supported for sync tar functions");
    return s3(a, o);
  } else if (Ds(a)) {
    let l = t(a, o);
    return h ? l.then(() => h(), h) : l;
  } else if (Is(a)) {
    if (typeof h == "function") throw new TypeError("callback not supported for sync tar functions");
    return e(a, o);
  } else if (Cs(a)) {
    if (typeof h == "function") throw new TypeError("callback only supported with file option");
    return i(a, o);
  }
  throw new Error("impossible options??");
}, { syncFile: s3, asyncFile: t, syncNoFile: e, asyncNoFile: i, validate: r });
var jr = qr.constants || { ZLIB_VERNUM: 4736 };
var M = Object.freeze(Object.assign(/* @__PURE__ */ Object.create(null), { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_MEM_ERROR: -4, Z_BUF_ERROR: -5, Z_VERSION_ERROR: -6, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, DEFLATE: 1, INFLATE: 2, GZIP: 3, GUNZIP: 4, DEFLATERAW: 5, INFLATERAW: 6, UNZIP: 7, BROTLI_DECODE: 8, BROTLI_ENCODE: 9, Z_MIN_WINDOWBITS: 8, Z_MAX_WINDOWBITS: 15, Z_DEFAULT_WINDOWBITS: 15, Z_MIN_CHUNK: 64, Z_MAX_CHUNK: 1 / 0, Z_DEFAULT_CHUNK: 16384, Z_MIN_MEMLEVEL: 1, Z_MAX_MEMLEVEL: 9, Z_DEFAULT_MEMLEVEL: 8, Z_MIN_LEVEL: -1, Z_MAX_LEVEL: 9, Z_DEFAULT_LEVEL: -1, BROTLI_OPERATION_PROCESS: 0, BROTLI_OPERATION_FLUSH: 1, BROTLI_OPERATION_FINISH: 2, BROTLI_OPERATION_EMIT_METADATA: 3, BROTLI_MODE_GENERIC: 0, BROTLI_MODE_TEXT: 1, BROTLI_MODE_FONT: 2, BROTLI_DEFAULT_MODE: 0, BROTLI_MIN_QUALITY: 0, BROTLI_MAX_QUALITY: 11, BROTLI_DEFAULT_QUALITY: 11, BROTLI_MIN_WINDOW_BITS: 10, BROTLI_MAX_WINDOW_BITS: 24, BROTLI_LARGE_MAX_WINDOW_BITS: 30, BROTLI_DEFAULT_WINDOW: 22, BROTLI_MIN_INPUT_BLOCK_BITS: 16, BROTLI_MAX_INPUT_BLOCK_BITS: 24, BROTLI_PARAM_MODE: 0, BROTLI_PARAM_QUALITY: 1, BROTLI_PARAM_LGWIN: 2, BROTLI_PARAM_LGBLOCK: 3, BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING: 4, BROTLI_PARAM_SIZE_HINT: 5, BROTLI_PARAM_LARGE_WINDOW: 6, BROTLI_PARAM_NPOSTFIX: 7, BROTLI_PARAM_NDIRECT: 8, BROTLI_DECODER_RESULT_ERROR: 0, BROTLI_DECODER_RESULT_SUCCESS: 1, BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT: 2, BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT: 3, BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION: 0, BROTLI_DECODER_PARAM_LARGE_WINDOW: 1, BROTLI_DECODER_NO_ERROR: 0, BROTLI_DECODER_SUCCESS: 1, BROTLI_DECODER_NEEDS_MORE_INPUT: 2, BROTLI_DECODER_NEEDS_MORE_OUTPUT: 3, BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE: -1, BROTLI_DECODER_ERROR_FORMAT_RESERVED: -2, BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE: -3, BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET: -4, BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME: -5, BROTLI_DECODER_ERROR_FORMAT_CL_SPACE: -6, BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE: -7, BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT: -8, BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1: -9, BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2: -10, BROTLI_DECODER_ERROR_FORMAT_TRANSFORM: -11, BROTLI_DECODER_ERROR_FORMAT_DICTIONARY: -12, BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS: -13, BROTLI_DECODER_ERROR_FORMAT_PADDING_1: -14, BROTLI_DECODER_ERROR_FORMAT_PADDING_2: -15, BROTLI_DECODER_ERROR_FORMAT_DISTANCE: -16, BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET: -19, BROTLI_DECODER_ERROR_INVALID_ARGUMENTS: -20, BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES: -21, BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS: -22, BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP: -25, BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1: -26, BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2: -27, BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES: -30, BROTLI_DECODER_ERROR_UNREACHABLE: -31 }, jr));
var Qr = gt.concat;
var vs = Object.getOwnPropertyDescriptor(gt, "concat");
var Jr = (s3) => s3;
var ki = vs?.writable === true || vs?.set !== void 0 ? (s3) => {
  gt.concat = s3 ? Jr : Qr;
} : (s3) => {
};
var Ot = Symbol("_superWrite");
var Gt = class extends Error {
  code;
  errno;
  constructor(t, e) {
    super("zlib: " + t.message, { cause: t }), this.code = t.code, this.errno = t.errno, this.code || (this.code = "ZLIB_ERROR"), this.message = "zlib: " + t.message, Error.captureStackTrace(this, e ?? this.constructor);
  }
  get name() {
    return "ZlibError";
  }
};
var vi = Symbol("flushFlag");
var ne = class extends D {
  #t = false;
  #i = false;
  #s;
  #n;
  #r;
  #e;
  #o;
  get sawError() {
    return this.#t;
  }
  get handle() {
    return this.#e;
  }
  get flushFlag() {
    return this.#s;
  }
  constructor(t, e) {
    if (!t || typeof t != "object") throw new TypeError("invalid options for ZlibBase constructor");
    if (super(t), this.#s = t.flush ?? 0, this.#n = t.finishFlush ?? 0, this.#r = t.fullFlushFlag ?? 0, typeof ks[e] != "function") throw new TypeError("Compression method not supported: " + e);
    try {
      this.#e = new ks[e](t);
    } catch (i) {
      throw new Gt(i, this.constructor);
    }
    this.#o = (i) => {
      this.#t || (this.#t = true, this.close(), this.emit("error", i));
    }, this.#e?.on("error", (i) => this.#o(new Gt(i))), this.once("end", () => this.close);
  }
  close() {
    this.#e && (this.#e.close(), this.#e = void 0, this.emit("close"));
  }
  reset() {
    if (!this.#t) return Mi(this.#e, "zlib binding closed"), this.#e.reset?.();
  }
  flush(t) {
    this.ended || (typeof t != "number" && (t = this.#r), this.write(Object.assign(gt.alloc(0), { [vi]: t })));
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, e = void 0, t = void 0), typeof e == "function" && (i = e, e = void 0), t && (e ? this.write(t, e) : this.write(t)), this.flush(this.#n), this.#i = true, super.end(i);
  }
  get ended() {
    return this.#i;
  }
  [Ot](t) {
    return super.write(t);
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = "utf8"), typeof t == "string" && (t = gt.from(t, e)), this.#t) return;
    Mi(this.#e, "zlib binding closed");
    let r = this.#e._handle, n = r.close;
    r.close = () => {
    };
    let o = this.#e.close;
    this.#e.close = () => {
    }, ki(true);
    let h;
    try {
      let l = typeof t[vi] == "number" ? t[vi] : this.#s;
      h = this.#e._processChunk(t, l), ki(false);
    } catch (l) {
      ki(false), this.#o(new Gt(l, this.write));
    } finally {
      this.#e && (this.#e._handle = r, r.close = n, this.#e.close = o, this.#e.removeAllListeners("error"));
    }
    this.#e && this.#e.on("error", (l) => this.#o(new Gt(l, this.write)));
    let a;
    if (h) if (Array.isArray(h) && h.length > 0) {
      let l = h[0];
      a = this[Ot](gt.from(l));
      for (let c = 1; c < h.length; c++) a = this[Ot](h[c]);
    } else a = this[Ot](gt.from(h));
    return i && i(), a;
  }
};
var Be = class extends ne {
  #t;
  #i;
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.Z_NO_FLUSH, t.finishFlush = t.finishFlush || M.Z_FINISH, t.fullFlushFlag = M.Z_FULL_FLUSH, super(t, e), this.#t = t.level, this.#i = t.strategy;
  }
  params(t, e) {
    if (!this.sawError) {
      if (!this.handle) throw new Error("cannot switch params when binding is closed");
      if (!this.handle.params) throw new Error("not supported in this implementation");
      if (this.#t !== t || this.#i !== e) {
        this.flush(M.Z_SYNC_FLUSH), Mi(this.handle, "zlib binding closed");
        let i = this.handle.flush;
        this.handle.flush = (r, n) => {
          typeof r == "function" && (n = r, r = this.flushFlag), this.flush(r), n?.();
        };
        try {
          this.handle.params(t, e);
        } finally {
          this.handle.flush = i;
        }
        this.handle && (this.#t = t, this.#i = e);
      }
    }
  }
};
var Pe = class extends Be {
  #t;
  constructor(t) {
    super(t, "Gzip"), this.#t = t && !!t.portable;
  }
  [Ot](t) {
    return this.#t ? (this.#t = false, t[9] = 255, super[Ot](t)) : super[Ot](t);
  }
};
var ze = class extends Be {
  constructor(t) {
    super(t, "Unzip");
  }
};
var Ue = class extends ne {
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.BROTLI_OPERATION_PROCESS, t.finishFlush = t.finishFlush || M.BROTLI_OPERATION_FINISH, t.fullFlushFlag = M.BROTLI_OPERATION_FLUSH, super(t, e);
  }
};
var He = class extends Ue {
  constructor(t) {
    super(t, "BrotliCompress");
  }
};
var We = class extends Ue {
  constructor(t) {
    super(t, "BrotliDecompress");
  }
};
var Ge = class extends ne {
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.ZSTD_e_continue, t.finishFlush = t.finishFlush || M.ZSTD_e_end, t.fullFlushFlag = M.ZSTD_e_flush, super(t, e);
  }
};
var Ze = class extends Ge {
  constructor(t) {
    super(t, "ZstdCompress");
  }
};
var Ye = class extends Ge {
  constructor(t) {
    super(t, "ZstdDecompress");
  }
};
var Ms = (s3, t) => {
  if (Number.isSafeInteger(s3)) s3 < 0 ? sn(s3, t) : en(s3, t);
  else throw Error("cannot encode number outside of javascript safe integer range");
  return t;
};
var en = (s3, t) => {
  t[0] = 128;
  for (var e = t.length; e > 1; e--) t[e - 1] = s3 & 255, s3 = Math.floor(s3 / 256);
};
var sn = (s3, t) => {
  t[0] = 255;
  var e = false;
  s3 = s3 * -1;
  for (var i = t.length; i > 1; i--) {
    var r = s3 & 255;
    s3 = Math.floor(s3 / 256), e ? t[i - 1] = Ps(r) : r === 0 ? t[i - 1] = 0 : (e = true, t[i - 1] = zs(r));
  }
};
var Bs = (s3) => {
  let t = s3[0], e = t === 128 ? nn(s3.subarray(1, s3.length)) : t === 255 ? rn(s3) : null;
  if (e === null) throw Error("invalid base256 encoding");
  if (!Number.isSafeInteger(e)) throw Error("parsed number outside of javascript safe integer range");
  return e;
};
var rn = (s3) => {
  for (var t = s3.length, e = 0, i = false, r = t - 1; r > -1; r--) {
    var n = Number(s3[r]), o;
    i ? o = Ps(n) : n === 0 ? o = n : (i = true, o = zs(n)), o !== 0 && (e -= o * Math.pow(256, t - r - 1));
  }
  return e;
};
var nn = (s3) => {
  for (var t = s3.length, e = 0, i = t - 1; i > -1; i--) {
    var r = Number(s3[i]);
    r !== 0 && (e += r * Math.pow(256, t - i - 1));
  }
  return e;
};
var Ps = (s3) => (255 ^ s3) & 255;
var zs = (s3) => (255 ^ s3) + 1 & 255;
var Bi = {};
vr(Bi, { code: () => Ke, isCode: () => oe, isName: () => hn, name: () => he });
var oe = (s3) => he.has(s3);
var hn = (s3) => Ke.has(s3);
var he = /* @__PURE__ */ new Map([["0", "File"], ["", "OldFile"], ["1", "Link"], ["2", "SymbolicLink"], ["3", "CharacterDevice"], ["4", "BlockDevice"], ["5", "Directory"], ["6", "FIFO"], ["7", "ContiguousFile"], ["g", "GlobalExtendedHeader"], ["x", "ExtendedHeader"], ["A", "SolarisACL"], ["D", "GNUDumpDir"], ["I", "Inode"], ["K", "NextFileHasLongLinkpath"], ["L", "NextFileHasLongPath"], ["M", "ContinuationFile"], ["N", "OldGnuLongPath"], ["S", "SparseFile"], ["V", "TapeVolumeHeader"], ["X", "OldExtendedHeader"]]);
var Ke = new Map(Array.from(he).map((s3) => [s3[1], s3[0]]));
var F = class {
  cksumValid = false;
  needPax = false;
  nullBlock = false;
  block;
  path;
  mode;
  uid;
  gid;
  size;
  cksum;
  #t = "Unsupported";
  linkpath;
  uname;
  gname;
  devmaj = 0;
  devmin = 0;
  atime;
  ctime;
  mtime;
  charset;
  comment;
  constructor(t, e = 0, i, r) {
    Buffer.isBuffer(t) ? this.decode(t, e || 0, i, r) : t && this.#i(t);
  }
  decode(t, e, i, r) {
    if (e || (e = 0), !t || !(t.length >= e + 512)) throw new Error("need 512 bytes for header");
    this.path = i?.path ?? Tt(t, e, 100), this.mode = i?.mode ?? r?.mode ?? at(t, e + 100, 8), this.uid = i?.uid ?? r?.uid ?? at(t, e + 108, 8), this.gid = i?.gid ?? r?.gid ?? at(t, e + 116, 8), this.size = i?.size ?? r?.size ?? at(t, e + 124, 12), this.mtime = i?.mtime ?? r?.mtime ?? Pi(t, e + 136, 12), this.cksum = at(t, e + 148, 12), r && this.#i(r, true), i && this.#i(i);
    let n = Tt(t, e + 156, 1);
    if (oe(n) && (this.#t = n || "0"), this.#t === "0" && this.path.slice(-1) === "/" && (this.#t = "5"), this.#t === "5" && (this.size = 0), this.linkpath = Tt(t, e + 157, 100), t.subarray(e + 257, e + 265).toString() === "ustar\x0000") if (this.uname = i?.uname ?? r?.uname ?? Tt(t, e + 265, 32), this.gname = i?.gname ?? r?.gname ?? Tt(t, e + 297, 32), this.devmaj = i?.devmaj ?? r?.devmaj ?? at(t, e + 329, 8) ?? 0, this.devmin = i?.devmin ?? r?.devmin ?? at(t, e + 337, 8) ?? 0, t[e + 475] !== 0) {
      let h = Tt(t, e + 345, 155);
      this.path = h + "/" + this.path;
    } else {
      let h = Tt(t, e + 345, 130);
      h && (this.path = h + "/" + this.path), this.atime = i?.atime ?? r?.atime ?? Pi(t, e + 476, 12), this.ctime = i?.ctime ?? r?.ctime ?? Pi(t, e + 488, 12);
    }
    let o = 256;
    for (let h = e; h < e + 148; h++) o += t[h];
    for (let h = e + 156; h < e + 512; h++) o += t[h];
    this.cksumValid = o === this.cksum, this.cksum === void 0 && o === 256 && (this.nullBlock = true);
  }
  #i(t, e = false) {
    Object.assign(this, Object.fromEntries(Object.entries(t).filter(([i, r]) => !(r == null || i === "path" && e || i === "linkpath" && e || i === "global"))));
  }
  encode(t, e = 0) {
    if (t || (t = this.block = Buffer.alloc(512)), this.#t === "Unsupported" && (this.#t = "0"), !(t.length >= e + 512)) throw new Error("need 512 bytes for header");
    let i = this.ctime || this.atime ? 130 : 155, r = an(this.path || "", i), n = r[0], o = r[1];
    this.needPax = !!r[2], this.needPax = xt(t, e, 100, n) || this.needPax, this.needPax = lt(t, e + 100, 8, this.mode) || this.needPax, this.needPax = lt(t, e + 108, 8, this.uid) || this.needPax, this.needPax = lt(t, e + 116, 8, this.gid) || this.needPax, this.needPax = lt(t, e + 124, 12, this.size) || this.needPax, this.needPax = zi(t, e + 136, 12, this.mtime) || this.needPax, t[e + 156] = Number(this.#t.codePointAt(0)), this.needPax = xt(t, e + 157, 100, this.linkpath) || this.needPax, t.write("ustar\x0000", e + 257, 8), this.needPax = xt(t, e + 265, 32, this.uname) || this.needPax, this.needPax = xt(t, e + 297, 32, this.gname) || this.needPax, this.needPax = lt(t, e + 329, 8, this.devmaj) || this.needPax, this.needPax = lt(t, e + 337, 8, this.devmin) || this.needPax, this.needPax = xt(t, e + 345, i, o) || this.needPax, t[e + 475] !== 0 ? this.needPax = xt(t, e + 345, 155, o) || this.needPax : (this.needPax = xt(t, e + 345, 130, o) || this.needPax, this.needPax = zi(t, e + 476, 12, this.atime) || this.needPax, this.needPax = zi(t, e + 488, 12, this.ctime) || this.needPax);
    let h = 256;
    for (let a = e; a < e + 148; a++) h += t[a];
    for (let a = e + 156; a < e + 512; a++) h += t[a];
    return this.cksum = h, lt(t, e + 148, 8, this.cksum), this.cksumValid = true, this.needPax;
  }
  get type() {
    return this.#t === "Unsupported" ? this.#t : he.get(this.#t);
  }
  get typeKey() {
    return this.#t;
  }
  set type(t) {
    let e = String(Ke.get(t));
    if (oe(e) || e === "Unsupported") this.#t = e;
    else if (oe(t)) this.#t = t;
    else throw new TypeError("invalid entry type: " + t);
  }
};
var an = (s3, t) => {
  let i = s3, r = "", n, o = Zt.parse(s3).root || ".";
  if (Buffer.byteLength(i) < 100) n = [i, r, false];
  else {
    r = Zt.dirname(i), i = Zt.basename(i);
    do
      Buffer.byteLength(i) <= 100 && Buffer.byteLength(r) <= t ? n = [i, r, false] : Buffer.byteLength(i) > 100 && Buffer.byteLength(r) <= t ? n = [i.slice(0, 99), r, true] : (i = Zt.join(Zt.basename(r), i), r = Zt.dirname(r));
    while (r !== o && n === void 0);
    n || (n = [s3.slice(0, 99), "", true]);
  }
  return n;
};
var Tt = (s3, t, e) => s3.subarray(t, t + e).toString("utf8").replace(/\0.*/, "");
var Pi = (s3, t, e) => ln(at(s3, t, e));
var ln = (s3) => s3 === void 0 ? void 0 : new Date(s3 * 1e3);
var at = (s3, t, e) => Number(s3[t]) & 128 ? Bs(s3.subarray(t, t + e)) : fn(s3, t, e);
var cn = (s3) => isNaN(s3) ? void 0 : s3;
var fn = (s3, t, e) => cn(parseInt(s3.subarray(t, t + e).toString("utf8").replace(/\0.*$/, "").trim(), 8));
var dn = { 12: 8589934591, 8: 2097151 };
var lt = (s3, t, e, i) => i === void 0 ? false : i > dn[e] || i < 0 ? (Ms(i, s3.subarray(t, t + e)), true) : (un(s3, t, e, i), false);
var un = (s3, t, e, i) => s3.write(mn(i, e), t, e, "ascii");
var mn = (s3, t) => pn(Math.floor(s3).toString(8), t);
var pn = (s3, t) => (s3.length === t - 1 ? s3 : new Array(t - s3.length - 1).join("0") + s3 + " ") + "\0";
var zi = (s3, t, e, i) => i === void 0 ? false : lt(s3, t, e, i.getTime() / 1e3);
var En = new Array(156).join("\0");
var xt = (s3, t, e, i) => i === void 0 ? false : (s3.write(i + En, t, e, "utf8"), i.length !== Buffer.byteLength(i) || i.length > e);
var ct = class s {
  atime;
  mtime;
  ctime;
  charset;
  comment;
  gid;
  uid;
  gname;
  uname;
  linkpath;
  dev;
  ino;
  nlink;
  path;
  size;
  mode;
  global;
  constructor(t, e = false) {
    this.atime = t.atime, this.charset = t.charset, this.comment = t.comment, this.ctime = t.ctime, this.dev = t.dev, this.gid = t.gid, this.global = e, this.gname = t.gname, this.ino = t.ino, this.linkpath = t.linkpath, this.mtime = t.mtime, this.nlink = t.nlink, this.path = t.path, this.size = t.size, this.uid = t.uid, this.uname = t.uname;
  }
  encode() {
    let t = this.encodeBody();
    if (t === "") return Buffer.allocUnsafe(0);
    let e = Buffer.byteLength(t), i = 512 * Math.ceil(1 + e / 512), r = Buffer.allocUnsafe(i);
    for (let n = 0; n < 512; n++) r[n] = 0;
    new F({ path: ("PaxHeader/" + wn(this.path ?? "")).slice(0, 99), mode: this.mode || 420, uid: this.uid, gid: this.gid, size: e, mtime: this.mtime, type: this.global ? "GlobalExtendedHeader" : "ExtendedHeader", linkpath: "", uname: this.uname || "", gname: this.gname || "", devmaj: 0, devmin: 0, atime: this.atime, ctime: this.ctime }).encode(r), r.write(t, 512, e, "utf8");
    for (let n = e + 512; n < r.length; n++) r[n] = 0;
    return r;
  }
  encodeBody() {
    return this.encodeField("path") + this.encodeField("ctime") + this.encodeField("atime") + this.encodeField("dev") + this.encodeField("ino") + this.encodeField("nlink") + this.encodeField("charset") + this.encodeField("comment") + this.encodeField("gid") + this.encodeField("gname") + this.encodeField("linkpath") + this.encodeField("mtime") + this.encodeField("size") + this.encodeField("uid") + this.encodeField("uname");
  }
  encodeField(t) {
    if (this[t] === void 0) return "";
    let e = this[t], i = e instanceof Date ? e.getTime() / 1e3 : e, r = " " + (t === "dev" || t === "ino" || t === "nlink" ? "SCHILY." : "") + t + "=" + i + `
`, n = Buffer.byteLength(r), o = Math.floor(Math.log(n) / Math.log(10)) + 1;
    return n + o >= Math.pow(10, o) && (o += 1), o + n + r;
  }
  static parse(t, e, i = false) {
    return new s(Sn(yn(t), e), i);
  }
};
var Sn = (s3, t) => t ? Object.assign({}, t, s3) : s3;
var yn = (s3) => s3.replace(/\n$/, "").split(`
`).reduce(Rn, /* @__PURE__ */ Object.create(null));
var Rn = (s3, t) => {
  let e = parseInt(t, 10);
  if (e !== Buffer.byteLength(t) + 1) return s3;
  t = t.slice((e + " ").length);
  let i = t.split("="), r = i.shift();
  if (!r) return s3;
  let n = r.replace(/^SCHILY\.(dev|ino|nlink)/, "$1"), o = i.join("=");
  return s3[n] = /^([A-Z]+\.)?([mac]|birth|creation)time$/.test(n) ? new Date(Number(o) * 1e3) : /^[0-9]+$/.test(o) ? +o : o, s3;
};
var bn = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var f = bn !== "win32" ? (s3) => s3 : (s3) => s3 && s3.replaceAll(/\\/g, "/");
var Yt = class extends D {
  extended;
  globalExtended;
  header;
  startBlockSize;
  blockRemain;
  remain;
  type;
  meta = false;
  ignore = false;
  path;
  mode;
  uid;
  gid;
  uname;
  gname;
  size = 0;
  mtime;
  atime;
  ctime;
  linkpath;
  dev;
  ino;
  nlink;
  invalid = false;
  absolute;
  unsupported = false;
  constructor(t, e, i) {
    switch (super({}), this.pause(), this.extended = e, this.globalExtended = i, this.header = t, this.remain = t.size ?? 0, this.startBlockSize = 512 * Math.ceil(this.remain / 512), this.blockRemain = this.startBlockSize, this.type = t.type, this.type) {
      case "File":
      case "OldFile":
      case "Link":
      case "SymbolicLink":
      case "CharacterDevice":
      case "BlockDevice":
      case "Directory":
      case "FIFO":
      case "ContiguousFile":
      case "GNUDumpDir":
        break;
      case "NextFileHasLongLinkpath":
      case "NextFileHasLongPath":
      case "OldGnuLongPath":
      case "GlobalExtendedHeader":
      case "ExtendedHeader":
      case "OldExtendedHeader":
        this.meta = true;
        break;
      default:
        this.ignore = true;
    }
    if (!t.path) throw new Error("no path provided for tar.ReadEntry");
    this.path = f(t.path), this.mode = t.mode, this.mode && (this.mode = this.mode & 4095), this.uid = t.uid, this.gid = t.gid, this.uname = t.uname, this.gname = t.gname, this.size = this.remain, this.mtime = t.mtime, this.atime = t.atime, this.ctime = t.ctime, this.linkpath = t.linkpath ? f(t.linkpath) : void 0, this.uname = t.uname, this.gname = t.gname, e && this.#t(e), i && this.#t(i, true);
  }
  write(t) {
    let e = t.length;
    if (e > this.blockRemain) throw new Error("writing more to entry than is appropriate");
    let i = this.remain, r = this.blockRemain;
    return this.remain = Math.max(0, i - e), this.blockRemain = Math.max(0, r - e), this.ignore ? true : i >= e ? super.write(t) : super.write(t.subarray(0, i));
  }
  #t(t, e = false) {
    t.path && (t.path = f(t.path)), t.linkpath && (t.linkpath = f(t.linkpath)), Object.assign(this, Object.fromEntries(Object.entries(t).filter(([i, r]) => !(r == null || i === "path" && e))));
  }
};
var Lt = (s3, t, e, i = {}) => {
  s3.file && (i.file = s3.file), s3.cwd && (i.cwd = s3.cwd), i.code = e instanceof Error && e.code || t, i.tarCode = t, !s3.strict && i.recoverable !== false ? (e instanceof Error && (i = Object.assign(e, i), e = e.message), s3.emit("warn", t, e, i)) : e instanceof Error ? s3.emit("error", Object.assign(e, i)) : s3.emit("error", Object.assign(new Error(`${t}: ${e}`), i));
};
var gn = 1024 * 1024;
var Zi = Buffer.from([31, 139]);
var Yi = Buffer.from([40, 181, 47, 253]);
var On = Math.max(Zi.length, Yi.length);
var B = Symbol("state");
var Nt = Symbol("writeEntry");
var et = Symbol("readEntry");
var Ui = Symbol("nextEntry");
var Us = Symbol("processEntry");
var V = Symbol("extendedHeader");
var ae = Symbol("globalExtendedHeader");
var ft = Symbol("meta");
var Hs = Symbol("emitMeta");
var p = Symbol("buffer");
var it = Symbol("queue");
var dt = Symbol("ended");
var Hi = Symbol("emittedEnd");
var At = Symbol("emit");
var y = Symbol("unzip");
var Ve = Symbol("consumeChunk");
var $e = Symbol("consumeChunkSub");
var Wi = Symbol("consumeBody");
var Ws = Symbol("consumeMeta");
var Gs = Symbol("consumeHeader");
var le = Symbol("consuming");
var Gi = Symbol("bufferConcat");
var Xe = Symbol("maybeEnd");
var Kt = Symbol("writing");
var ut = Symbol("aborted");
var qe = Symbol("onDone");
var Dt = Symbol("sawValidEntry");
var je = Symbol("sawNullBlock");
var Qe = Symbol("sawEOF");
var Zs = Symbol("closeStream");
var Tn = () => true;
var st = class extends _n {
  file;
  strict;
  maxMetaEntrySize;
  filter;
  brotli;
  zstd;
  writable = true;
  readable = false;
  [it] = [];
  [p];
  [et];
  [Nt];
  [B] = "begin";
  [ft] = "";
  [V];
  [ae];
  [dt] = false;
  [y];
  [ut] = false;
  [Dt];
  [je] = false;
  [Qe] = false;
  [Kt] = false;
  [le] = false;
  [Hi] = false;
  constructor(t = {}) {
    super(), this.file = t.file || "", this.on(qe, () => {
      (this[B] === "begin" || this[Dt] === false) && this.warn("TAR_BAD_ARCHIVE", "Unrecognized archive format");
    }), t.ondone ? this.on(qe, t.ondone) : this.on(qe, () => {
      this.emit("prefinish"), this.emit("finish"), this.emit("end");
    }), this.strict = !!t.strict, this.maxMetaEntrySize = t.maxMetaEntrySize || gn, this.filter = typeof t.filter == "function" ? t.filter : Tn;
    let e = t.file && (t.file.endsWith(".tar.br") || t.file.endsWith(".tbr"));
    this.brotli = !(t.gzip || t.zstd) && t.brotli !== void 0 ? t.brotli : e ? void 0 : false;
    let i = t.file && (t.file.endsWith(".tar.zst") || t.file.endsWith(".tzst"));
    this.zstd = !(t.gzip || t.brotli) && t.zstd !== void 0 ? t.zstd : i ? true : void 0, this.on("end", () => this[Zs]()), typeof t.onwarn == "function" && this.on("warn", t.onwarn), typeof t.onReadEntry == "function" && this.on("entry", t.onReadEntry);
  }
  warn(t, e, i = {}) {
    Lt(this, t, e, i);
  }
  [Gs](t, e) {
    this[Dt] === void 0 && (this[Dt] = false);
    let i;
    try {
      i = new F(t, e, this[V], this[ae]);
    } catch (r) {
      return this.warn("TAR_ENTRY_INVALID", r);
    }
    if (i.nullBlock) this[je] ? (this[Qe] = true, this[B] === "begin" && (this[B] = "header"), this[At]("eof")) : (this[je] = true, this[At]("nullBlock"));
    else if (this[je] = false, !i.cksumValid) this.warn("TAR_ENTRY_INVALID", "checksum failure", { header: i });
    else if (!i.path) this.warn("TAR_ENTRY_INVALID", "path is required", { header: i });
    else {
      let r = i.type;
      if (/^(Symbolic)?Link$/.test(r) && !i.linkpath) this.warn("TAR_ENTRY_INVALID", "linkpath required", { header: i });
      else if (!/^(Symbolic)?Link$/.test(r) && !/^(Global)?ExtendedHeader$/.test(r) && i.linkpath) this.warn("TAR_ENTRY_INVALID", "linkpath forbidden", { header: i });
      else {
        let n = this[Nt] = new Yt(i, this[V], this[ae]);
        if (!this[Dt]) if (n.remain) {
          let o = () => {
            n.invalid || (this[Dt] = true);
          };
          n.on("end", o);
        } else this[Dt] = true;
        n.meta ? n.size > this.maxMetaEntrySize ? (n.ignore = true, this[At]("ignoredEntry", n), this[B] = "ignore", n.resume()) : n.size > 0 && (this[ft] = "", n.on("data", (o) => this[ft] += o), this[B] = "meta") : (this[V] = void 0, n.ignore = n.ignore || !this.filter(n.path, n), n.ignore ? (this[At]("ignoredEntry", n), this[B] = n.remain ? "ignore" : "header", n.resume()) : (n.remain ? this[B] = "body" : (this[B] = "header", n.end()), this[et] ? this[it].push(n) : (this[it].push(n), this[Ui]())));
      }
    }
  }
  [Zs]() {
    queueMicrotask(() => this.emit("close"));
  }
  [Us](t) {
    let e = true;
    if (!t) this[et] = void 0, e = false;
    else if (Array.isArray(t)) {
      let [i, ...r] = t;
      this.emit(i, ...r);
    } else this[et] = t, this.emit("entry", t), t.emittedEnd || (t.on("end", () => this[Ui]()), e = false);
    return e;
  }
  [Ui]() {
    do
      ;
    while (this[Us](this[it].shift()));
    if (this[it].length === 0) {
      let t = this[et];
      !t || t.flowing || t.size === t.remain ? this[Kt] || this.emit("drain") : t.once("drain", () => this.emit("drain"));
    }
  }
  [Wi](t, e) {
    let i = this[Nt];
    if (!i) throw new Error("attempt to consume body without entry??");
    let r = i.blockRemain ?? 0, n = r >= t.length && e === 0 ? t : t.subarray(e, e + r);
    return i.write(n), i.blockRemain || (this[B] = "header", this[Nt] = void 0, i.end()), n.length;
  }
  [Ws](t, e) {
    let i = this[Nt], r = this[Wi](t, e);
    return !this[Nt] && i && this[Hs](i), r;
  }
  [At](t, e, i) {
    this[it].length === 0 && !this[et] ? this.emit(t, e, i) : this[it].push([t, e, i]);
  }
  [Hs](t) {
    switch (this[At]("meta", this[ft]), t.type) {
      case "ExtendedHeader":
      case "OldExtendedHeader":
        this[V] = ct.parse(this[ft], this[V], false);
        break;
      case "GlobalExtendedHeader":
        this[ae] = ct.parse(this[ft], this[ae], true);
        break;
      case "NextFileHasLongPath":
      case "OldGnuLongPath": {
        let e = this[V] ?? /* @__PURE__ */ Object.create(null);
        this[V] = e, e.path = this[ft].replace(/\0.*/, "");
        break;
      }
      case "NextFileHasLongLinkpath": {
        let e = this[V] || /* @__PURE__ */ Object.create(null);
        this[V] = e, e.linkpath = this[ft].replace(/\0.*/, "");
        break;
      }
      default:
        throw new Error("unknown meta: " + t.type);
    }
  }
  abort(t) {
    this[ut] = true, this.emit("abort", t), this.warn("TAR_ABORT", t, { recoverable: false });
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8")), this[ut]) return i?.(), false;
    if ((this[y] === void 0 || this.brotli === void 0 && this[y] === false) && t) {
      if (this[p] && (t = Buffer.concat([this[p], t]), this[p] = void 0), t.length < On) return this[p] = t, i?.(), true;
      for (let a = 0; this[y] === void 0 && a < Zi.length; a++) t[a] !== Zi[a] && (this[y] = false);
      let o = false;
      if (this[y] === false && this.zstd !== false) {
        o = true;
        for (let a = 0; a < Yi.length; a++) if (t[a] !== Yi[a]) {
          o = false;
          break;
        }
      }
      let h = this.brotli === void 0 && !o;
      if (this[y] === false && h) if (t.length < 512) if (this[dt]) this.brotli = true;
      else return this[p] = t, i?.(), true;
      else try {
        new F(t.subarray(0, 512)), this.brotli = false;
      } catch {
        this.brotli = true;
      }
      if (this[y] === void 0 || this[y] === false && (this.brotli || o)) {
        let a = this[dt];
        this[dt] = false, this[y] = this[y] === void 0 ? new ze({}) : o ? new Ye({}) : new We({}), this[y].on("data", (c) => this[Ve](c)), this[y].on("error", (c) => this.abort(c)), this[y].on("end", () => {
          this[dt] = true, this[Ve]();
        }), this[Kt] = true;
        let l = !!this[y][a ? "end" : "write"](t);
        return this[Kt] = false, i?.(), l;
      }
    }
    this[Kt] = true, this[y] ? this[y].write(t) : this[Ve](t), this[Kt] = false;
    let n = this[it].length > 0 ? false : this[et] ? this[et].flowing : true;
    return !n && this[it].length === 0 && this[et]?.once("drain", () => this.emit("drain")), i?.(), n;
  }
  [Gi](t) {
    t && !this[ut] && (this[p] = this[p] ? Buffer.concat([this[p], t]) : t);
  }
  [Xe]() {
    if (this[dt] && !this[Hi] && !this[ut] && !this[le]) {
      this[Hi] = true;
      let t = this[Nt];
      if (t && t.blockRemain) {
        let e = this[p] ? this[p].length : 0;
        this.warn("TAR_BAD_ARCHIVE", `Truncated input (needed ${t.blockRemain} more bytes, only ${e} available)`, { entry: t }), this[p] && t.write(this[p]), t.end();
      }
      this[At](qe);
    }
  }
  [Ve](t) {
    if (this[le] && t) this[Gi](t);
    else if (!t && !this[p]) this[Xe]();
    else if (t) {
      if (this[le] = true, this[p]) {
        this[Gi](t);
        let e = this[p];
        this[p] = void 0, this[$e](e);
      } else this[$e](t);
      for (; this[p] && this[p]?.length >= 512 && !this[ut] && !this[Qe]; ) {
        let e = this[p];
        this[p] = void 0, this[$e](e);
      }
      this[le] = false;
    }
    (!this[p] || this[dt]) && this[Xe]();
  }
  [$e](t) {
    let e = 0, i = t.length;
    for (; e + 512 <= i && !this[ut] && !this[Qe]; ) switch (this[B]) {
      case "begin":
      case "header":
        this[Gs](t, e), e += 512;
        break;
      case "ignore":
      case "body":
        e += this[Wi](t, e);
        break;
      case "meta":
        e += this[Ws](t, e);
        break;
      default:
        throw new Error("invalid state: " + this[B]);
    }
    e < i && (this[p] = this[p] ? Buffer.concat([t.subarray(e), this[p]]) : t.subarray(e));
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, e = void 0, t = void 0), typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, e)), i && this.once("finish", i), this[ut] || (this[y] ? (t && this[y].write(t), this[y].end()) : (this[dt] = true, (this.brotli === void 0 || this.zstd === void 0) && (t = t || Buffer.alloc(0)), t && this.write(t), this[Xe]())), this;
  }
};
var mt = (s3) => {
  let t = s3.length - 1, e = -1;
  for (; t > -1 && s3.charAt(t) === "/"; ) e = t, t--;
  return e === -1 ? s3 : s3.slice(0, e);
};
var Nn = (s3) => {
  let t = s3.onReadEntry;
  s3.onReadEntry = t ? (e) => {
    t(e), e.resume();
  } : (e) => e.resume();
};
var Ki = (s3, t) => {
  let e = new Map(t.map((n) => [mt(n), true])), i = s3.filter, r = (n, o = "") => {
    let h = o || Ln(n).root || ".", a;
    if (n === h) a = false;
    else {
      let l = e.get(n);
      a = l !== void 0 ? l : r(xn(n), h);
    }
    return e.set(n, a), a;
  };
  s3.filter = i ? (n, o) => i(n, o) && r(mt(n)) : (n) => r(mt(n));
};
var An = (s3) => {
  let t = new st(s3), e = s3.file, i;
  try {
    i = Vt.openSync(e, "r");
    let r = Vt.fstatSync(i), n = s3.maxReadSize || 16 * 1024 * 1024;
    if (r.size < n) {
      let o = Buffer.allocUnsafe(r.size), h = Vt.readSync(i, o, 0, r.size, 0);
      t.end(h === o.byteLength ? o : o.subarray(0, h));
    } else {
      let o = 0, h = Buffer.allocUnsafe(n);
      for (; o < r.size; ) {
        let a = Vt.readSync(i, h, 0, n, o);
        if (a === 0) break;
        o += a, t.write(h.subarray(0, a));
      }
      t.end();
    }
  } finally {
    if (typeof i == "number") try {
      Vt.closeSync(i);
    } catch {
    }
  }
};
var Dn = (s3, t) => {
  let e = new st(s3), i = s3.maxReadSize || 16 * 1024 * 1024, r = s3.file;
  return new Promise((o, h) => {
    e.on("error", h), e.on("end", o), Vt.stat(r, (a, l) => {
      if (a) h(a);
      else {
        let c = new _t(r, { readSize: i, size: l.size });
        c.on("error", h), c.pipe(e);
      }
    });
  });
};
var It = K(An, Dn, (s3) => new st(s3), (s3) => new st(s3), (s3, t) => {
  t?.length && Ki(s3, t), s3.noResume || Nn(s3);
});
var Vi = (s3, t, e) => (s3 &= 4095, e && (s3 = (s3 | 384) & -19), t && (s3 & 256 && (s3 |= 64), s3 & 32 && (s3 |= 8), s3 & 4 && (s3 |= 1)), s3);
var { isAbsolute: Cn, parse: Ys } = In;
var ce = (s3) => {
  let t = "", e = Ys(s3);
  for (; Cn(s3) || e.root; ) {
    let i = s3.charAt(0) === "/" && s3.slice(0, 4) !== "//?/" ? "/" : e.root;
    s3 = s3.slice(i.length), t += i, e = Ys(s3);
  }
  return [t, s3];
};
var Je = ["|", "<", ">", "?", ":"];
var $i = Je.map((s3) => String.fromCodePoint(61440 + Number(s3.codePointAt(0))));
var Fn = new Map(Je.map((s3, t) => [s3, $i[t]]));
var kn = new Map($i.map((s3, t) => [s3, Je[t]]));
var Xi = (s3) => Je.reduce((t, e) => t.split(e).join(Fn.get(e)), s3);
var Ks = (s3) => $i.reduce((t, e) => t.split(e).join(kn.get(e)), s3);
var Js = (s3, t) => t ? (s3 = f(s3).replace(/^\.(\/|$)/, ""), mt(t) + "/" + s3) : f(s3);
var vn = 16 * 1024 * 1024;
var Xs = Symbol("process");
var qs = Symbol("file");
var js = Symbol("directory");
var ji = Symbol("symlink");
var Qs = Symbol("hardlink");
var fe = Symbol("header");
var ti = Symbol("read");
var Qi = Symbol("lstat");
var ei = Symbol("onlstat");
var Ji = Symbol("onread");
var ts = Symbol("onreadlink");
var es = Symbol("openfile");
var is = Symbol("onopenfile");
var pt = Symbol("close");
var ii = Symbol("mode");
var ss = Symbol("awaitDrain");
var qi = Symbol("ondrain");
var X = Symbol("prefix");
var de = class extends D {
  path;
  portable;
  myuid = process.getuid && process.getuid() || 0;
  myuser = process.env.USER || "";
  maxReadSize;
  linkCache;
  statCache;
  preservePaths;
  cwd;
  strict;
  mtime;
  noPax;
  noMtime;
  prefix;
  fd;
  blockLen = 0;
  blockRemain = 0;
  buf;
  pos = 0;
  remain = 0;
  length = 0;
  offset = 0;
  win32;
  absolute;
  header;
  type;
  linkpath;
  stat;
  onWriteEntry;
  #t = false;
  constructor(t, e = {}) {
    let i = re(e);
    super(), this.path = f(t), this.portable = !!i.portable, this.maxReadSize = i.maxReadSize || vn, this.linkCache = i.linkCache || /* @__PURE__ */ new Map(), this.statCache = i.statCache || /* @__PURE__ */ new Map(), this.preservePaths = !!i.preservePaths, this.cwd = f(i.cwd || process.cwd()), this.strict = !!i.strict, this.noPax = !!i.noPax, this.noMtime = !!i.noMtime, this.mtime = i.mtime, this.prefix = i.prefix ? f(i.prefix) : void 0, this.onWriteEntry = i.onWriteEntry, typeof i.onwarn == "function" && this.on("warn", i.onwarn);
    let r = false;
    if (!this.preservePaths) {
      let [o, h] = ce(this.path);
      o && typeof h == "string" && (this.path = h, r = o);
    }
    this.win32 = !!i.win32 || process.platform === "win32", this.win32 && (this.path = Ks(this.path.replaceAll(/\\/g, "/")), t = t.replaceAll(/\\/g, "/")), this.absolute = f(i.absolute || $s.resolve(this.cwd, t)), this.path === "" && (this.path = "./"), r && this.warn("TAR_ENTRY_INFO", `stripping ${r} from absolute path`, { entry: this, path: r + this.path });
    let n = this.statCache.get(this.absolute);
    n ? this[ei](n) : this[Qi]();
  }
  warn(t, e, i = {}) {
    return Lt(this, t, e, i);
  }
  emit(t, ...e) {
    return t === "error" && (this.#t = true), super.emit(t, ...e);
  }
  [Qi]() {
    $.lstat(this.absolute, (t, e) => {
      if (t) return this.emit("error", t);
      this[ei](e);
    });
  }
  [ei](t) {
    this.statCache.set(this.absolute, t), this.stat = t, t.isFile() || (t.size = 0), this.type = Mn(t), this.emit("stat", t), this[Xs]();
  }
  [Xs]() {
    switch (this.type) {
      case "File":
        return this[qs]();
      case "Directory":
        return this[js]();
      case "SymbolicLink":
        return this[ji]();
      default:
        return this.end();
    }
  }
  [ii](t) {
    return Vi(t, this.type === "Directory", this.portable);
  }
  [X](t) {
    return Js(t, this.prefix);
  }
  [fe]() {
    if (!this.stat) throw new Error("cannot write header before stat");
    this.type === "Directory" && this.portable && (this.noMtime = true), this.onWriteEntry?.(this), this.header = new F({ path: this[X](this.path), linkpath: this.type === "Link" && this.linkpath !== void 0 ? this[X](this.linkpath) : this.linkpath, mode: this[ii](this.stat.mode), uid: this.portable ? void 0 : this.stat.uid, gid: this.portable ? void 0 : this.stat.gid, size: this.stat.size, mtime: this.noMtime ? void 0 : this.mtime || this.stat.mtime, type: this.type === "Unsupported" ? void 0 : this.type, uname: this.portable ? void 0 : this.stat.uid === this.myuid ? this.myuser : "", atime: this.portable ? void 0 : this.stat.atime, ctime: this.portable ? void 0 : this.stat.ctime }), this.header.encode() && !this.noPax && super.write(new ct({ atime: this.portable ? void 0 : this.header.atime, ctime: this.portable ? void 0 : this.header.ctime, gid: this.portable ? void 0 : this.header.gid, mtime: this.noMtime ? void 0 : this.mtime || this.header.mtime, path: this[X](this.path), linkpath: this.type === "Link" && this.linkpath !== void 0 ? this[X](this.linkpath) : this.linkpath, size: this.header.size, uid: this.portable ? void 0 : this.header.uid, uname: this.portable ? void 0 : this.header.uname, dev: this.portable ? void 0 : this.stat.dev, ino: this.portable ? void 0 : this.stat.ino, nlink: this.portable ? void 0 : this.stat.nlink }).encode());
    let t = this.header?.block;
    if (!t) throw new Error("failed to encode header");
    super.write(t);
  }
  [js]() {
    if (!this.stat) throw new Error("cannot create directory entry without stat");
    this.path.slice(-1) !== "/" && (this.path += "/"), this.stat.size = 0, this[fe](), this.end();
  }
  [ji]() {
    $.readlink(this.absolute, (t, e) => {
      if (t) return this.emit("error", t);
      this[ts](e);
    });
  }
  [ts](t) {
    this.linkpath = f(t), this[fe](), this.end();
  }
  [Qs](t) {
    if (!this.stat) throw new Error("cannot create link entry without stat");
    this.type = "Link", this.linkpath = f($s.relative(this.cwd, t)), this.stat.size = 0, this[fe](), this.end();
  }
  [qs]() {
    if (!this.stat) throw new Error("cannot create file entry without stat");
    if (this.stat.nlink > 1) {
      let t = `${this.stat.dev}:${this.stat.ino}`, e = this.linkCache.get(t);
      if (e?.indexOf(this.cwd) === 0) return this[Qs](e);
      this.linkCache.set(t, this.absolute);
    }
    if (this[fe](), this.stat.size === 0) return this.end();
    this[es]();
  }
  [es]() {
    $.open(this.absolute, "r", (t, e) => {
      if (t) return this.emit("error", t);
      this[is](e);
    });
  }
  [is](t) {
    if (this.fd = t, this.#t) return this[pt]();
    if (!this.stat) throw new Error("should stat before calling onopenfile");
    this.blockLen = 512 * Math.ceil(this.stat.size / 512), this.blockRemain = this.blockLen;
    let e = Math.min(this.blockLen, this.maxReadSize);
    this.buf = Buffer.allocUnsafe(e), this.offset = 0, this.pos = 0, this.remain = this.stat.size, this.length = this.buf.length, this[ti]();
  }
  [ti]() {
    let { fd: t, buf: e, offset: i, length: r, pos: n } = this;
    if (t === void 0 || e === void 0) throw new Error("cannot read file without first opening");
    $.read(t, e, i, r, n, (o, h) => {
      if (o) return this[pt](() => this.emit("error", o));
      this[Ji](h);
    });
  }
  [pt](t = () => {
  }) {
    this.fd !== void 0 && $.close(this.fd, t);
  }
  [Ji](t) {
    if (t <= 0 && this.remain > 0) {
      let r = Object.assign(new Error("encountered unexpected EOF"), { path: this.absolute, syscall: "read", code: "EOF" });
      return this[pt](() => this.emit("error", r));
    }
    if (t > this.remain) {
      let r = Object.assign(new Error("did not encounter expected EOF"), { path: this.absolute, syscall: "read", code: "EOF" });
      return this[pt](() => this.emit("error", r));
    }
    if (!this.buf) throw new Error("should have created buffer prior to reading");
    if (t === this.remain) for (let r = t; r < this.length && t < this.blockRemain; r++) this.buf[r + this.offset] = 0, t++, this.remain++;
    let e = this.offset === 0 && t === this.buf.length ? this.buf : this.buf.subarray(this.offset, this.offset + t);
    this.write(e) ? this[qi]() : this[ss](() => this[qi]());
  }
  [ss](t) {
    this.once("drain", t);
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8")), this.blockRemain < t.length) {
      let r = Object.assign(new Error("writing more data than expected"), { path: this.absolute });
      return this.emit("error", r);
    }
    return this.remain -= t.length, this.blockRemain -= t.length, this.pos += t.length, this.offset += t.length, super.write(t, null, i);
  }
  [qi]() {
    if (!this.remain) return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), this[pt]((t) => t ? this.emit("error", t) : this.end());
    if (!this.buf) throw new Error("buffer lost somehow in ONDRAIN");
    this.offset >= this.length && (this.buf = Buffer.allocUnsafe(Math.min(this.blockRemain, this.buf.length)), this.offset = 0), this.length = this.buf.length - this.offset, this[ti]();
  }
};
var si = class extends de {
  sync = true;
  [Qi]() {
    this[ei]($.lstatSync(this.absolute));
  }
  [ji]() {
    this[ts]($.readlinkSync(this.absolute));
  }
  [es]() {
    this[is]($.openSync(this.absolute, "r"));
  }
  [ti]() {
    let t = true;
    try {
      let { fd: e, buf: i, offset: r, length: n, pos: o } = this;
      if (e === void 0 || i === void 0) throw new Error("fd and buf must be set in READ method");
      let h = $.readSync(e, i, r, n, o);
      this[Ji](h), t = false;
    } finally {
      if (t) try {
        this[pt](() => {
        });
      } catch {
      }
    }
  }
  [ss](t) {
    t();
  }
  [pt](t = () => {
  }) {
    this.fd !== void 0 && $.closeSync(this.fd), t();
  }
};
var ri = class extends D {
  blockLen = 0;
  blockRemain = 0;
  buf = 0;
  pos = 0;
  remain = 0;
  length = 0;
  preservePaths;
  portable;
  strict;
  noPax;
  noMtime;
  readEntry;
  type;
  prefix;
  path;
  mode;
  uid;
  gid;
  uname;
  gname;
  header;
  mtime;
  atime;
  ctime;
  linkpath;
  size;
  onWriteEntry;
  warn(t, e, i = {}) {
    return Lt(this, t, e, i);
  }
  constructor(t, e = {}) {
    let i = re(e);
    super(), this.preservePaths = !!i.preservePaths, this.portable = !!i.portable, this.strict = !!i.strict, this.noPax = !!i.noPax, this.noMtime = !!i.noMtime, this.onWriteEntry = i.onWriteEntry, this.readEntry = t;
    let { type: r } = t;
    if (r === "Unsupported") throw new Error("writing entry that should be ignored");
    this.type = r, this.type === "Directory" && this.portable && (this.noMtime = true), this.prefix = i.prefix, this.path = f(t.path), this.mode = t.mode !== void 0 ? this[ii](t.mode) : void 0, this.uid = this.portable ? void 0 : t.uid, this.gid = this.portable ? void 0 : t.gid, this.uname = this.portable ? void 0 : t.uname, this.gname = this.portable ? void 0 : t.gname, this.size = t.size, this.mtime = this.noMtime ? void 0 : i.mtime || t.mtime, this.atime = this.portable ? void 0 : t.atime, this.ctime = this.portable ? void 0 : t.ctime, this.linkpath = t.linkpath !== void 0 ? f(t.linkpath) : void 0, typeof i.onwarn == "function" && this.on("warn", i.onwarn);
    let n = false;
    if (!this.preservePaths) {
      let [h, a] = ce(this.path);
      h && typeof a == "string" && (this.path = a, n = h);
    }
    this.remain = t.size, this.blockRemain = t.startBlockSize, this.onWriteEntry?.(this), this.header = new F({ path: this[X](this.path), linkpath: this.type === "Link" && this.linkpath !== void 0 ? this[X](this.linkpath) : this.linkpath, mode: this.mode, uid: this.portable ? void 0 : this.uid, gid: this.portable ? void 0 : this.gid, size: this.size, mtime: this.noMtime ? void 0 : this.mtime, type: this.type, uname: this.portable ? void 0 : this.uname, atime: this.portable ? void 0 : this.atime, ctime: this.portable ? void 0 : this.ctime }), n && this.warn("TAR_ENTRY_INFO", `stripping ${n} from absolute path`, { entry: this, path: n + this.path }), this.header.encode() && !this.noPax && super.write(new ct({ atime: this.portable ? void 0 : this.atime, ctime: this.portable ? void 0 : this.ctime, gid: this.portable ? void 0 : this.gid, mtime: this.noMtime ? void 0 : this.mtime, path: this[X](this.path), linkpath: this.type === "Link" && this.linkpath !== void 0 ? this[X](this.linkpath) : this.linkpath, size: this.size, uid: this.portable ? void 0 : this.uid, uname: this.portable ? void 0 : this.uname, dev: this.portable ? void 0 : this.readEntry.dev, ino: this.portable ? void 0 : this.readEntry.ino, nlink: this.portable ? void 0 : this.readEntry.nlink }).encode());
    let o = this.header?.block;
    if (!o) throw new Error("failed to encode header");
    super.write(o), t.pipe(this);
  }
  [X](t) {
    return Js(t, this.prefix);
  }
  [ii](t) {
    return Vi(t, this.type === "Directory", this.portable);
  }
  write(t, e, i) {
    typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8"));
    let r = t.length;
    if (r > this.blockRemain) throw new Error("writing more to entry than is appropriate");
    return this.blockRemain -= r, super.write(t, i);
  }
  end(t, e, i) {
    return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), typeof t == "function" && (i = t, e = void 0, t = void 0), typeof e == "function" && (i = e, e = void 0), typeof t == "string" && (t = Buffer.from(t, e ?? "utf8")), i && this.once("finish", i), t ? super.end(t, i) : super.end(i), this;
  }
};
var Mn = (s3) => s3.isFile() ? "File" : s3.isDirectory() ? "Directory" : s3.isSymbolicLink() ? "SymbolicLink" : "Unsupported";
var ni = class s2 {
  tail;
  head;
  length = 0;
  static create(t = []) {
    return new s2(t);
  }
  constructor(t = []) {
    for (let e of t) this.push(e);
  }
  *[Symbol.iterator]() {
    for (let t = this.head; t; t = t.next) yield t.value;
  }
  removeNode(t) {
    if (t.list !== this) throw new Error("removing node which does not belong to this list");
    let e = t.next, i = t.prev;
    return e && (e.prev = i), i && (i.next = e), t === this.head && (this.head = e), t === this.tail && (this.tail = i), this.length--, t.next = void 0, t.prev = void 0, t.list = void 0, e;
  }
  unshiftNode(t) {
    if (t === this.head) return;
    t.list && t.list.removeNode(t);
    let e = this.head;
    t.list = this, t.next = e, e && (e.prev = t), this.head = t, this.tail || (this.tail = t), this.length++;
  }
  pushNode(t) {
    if (t === this.tail) return;
    t.list && t.list.removeNode(t);
    let e = this.tail;
    t.list = this, t.prev = e, e && (e.next = t), this.tail = t, this.head || (this.head = t), this.length++;
  }
  push(...t) {
    for (let e = 0, i = t.length; e < i; e++) Pn(this, t[e]);
    return this.length;
  }
  unshift(...t) {
    for (var e = 0, i = t.length; e < i; e++) zn(this, t[e]);
    return this.length;
  }
  pop() {
    if (!this.tail) return;
    let t = this.tail.value, e = this.tail;
    return this.tail = this.tail.prev, this.tail ? this.tail.next = void 0 : this.head = void 0, e.list = void 0, this.length--, t;
  }
  shift() {
    if (!this.head) return;
    let t = this.head.value, e = this.head;
    return this.head = this.head.next, this.head ? this.head.prev = void 0 : this.tail = void 0, e.list = void 0, this.length--, t;
  }
  forEach(t, e) {
    e = e || this;
    for (let i = this.head, r = 0; i; r++) t.call(e, i.value, r, this), i = i.next;
  }
  forEachReverse(t, e) {
    e = e || this;
    for (let i = this.tail, r = this.length - 1; i; r--) t.call(e, i.value, r, this), i = i.prev;
  }
  get(t) {
    let e = 0, i = this.head;
    for (; i && e < t; e++) i = i.next;
    if (e === t && i) return i.value;
  }
  getReverse(t) {
    let e = 0, i = this.tail;
    for (; i && e < t; e++) i = i.prev;
    if (e === t && i) return i.value;
  }
  map(t, e) {
    e = e || this;
    let i = new s2();
    for (let r = this.head; r; ) i.push(t.call(e, r.value, this)), r = r.next;
    return i;
  }
  mapReverse(t, e) {
    e = e || this;
    var i = new s2();
    for (let r = this.tail; r; ) i.push(t.call(e, r.value, this)), r = r.prev;
    return i;
  }
  reduce(t, e) {
    let i, r = this.head;
    if (arguments.length > 1) i = e;
    else if (this.head) r = this.head.next, i = this.head.value;
    else throw new TypeError("Reduce of empty list with no initial value");
    for (var n = 0; r; n++) i = t(i, r.value, n), r = r.next;
    return i;
  }
  reduceReverse(t, e) {
    let i, r = this.tail;
    if (arguments.length > 1) i = e;
    else if (this.tail) r = this.tail.prev, i = this.tail.value;
    else throw new TypeError("Reduce of empty list with no initial value");
    for (let n = this.length - 1; r; n--) i = t(i, r.value, n), r = r.prev;
    return i;
  }
  toArray() {
    let t = new Array(this.length);
    for (let e = 0, i = this.head; i; e++) t[e] = i.value, i = i.next;
    return t;
  }
  toArrayReverse() {
    let t = new Array(this.length);
    for (let e = 0, i = this.tail; i; e++) t[e] = i.value, i = i.prev;
    return t;
  }
  slice(t = 0, e = this.length) {
    e < 0 && (e += this.length), t < 0 && (t += this.length);
    let i = new s2();
    if (e < t || e < 0) return i;
    t < 0 && (t = 0), e > this.length && (e = this.length);
    let r = this.head, n = 0;
    for (n = 0; r && n < t; n++) r = r.next;
    for (; r && n < e; n++, r = r.next) i.push(r.value);
    return i;
  }
  sliceReverse(t = 0, e = this.length) {
    e < 0 && (e += this.length), t < 0 && (t += this.length);
    let i = new s2();
    if (e < t || e < 0) return i;
    t < 0 && (t = 0), e > this.length && (e = this.length);
    let r = this.length, n = this.tail;
    for (; n && r > e; r--) n = n.prev;
    for (; n && r > t; r--, n = n.prev) i.push(n.value);
    return i;
  }
  splice(t, e = 0, ...i) {
    t > this.length && (t = this.length - 1), t < 0 && (t = this.length + t);
    let r = this.head;
    for (let o = 0; r && o < t; o++) r = r.next;
    let n = [];
    for (let o = 0; r && o < e; o++) n.push(r.value), r = this.removeNode(r);
    r ? r !== this.tail && (r = r.prev) : r = this.tail;
    for (let o of i) r = Bn(this, r, o);
    return n;
  }
  reverse() {
    let t = this.head, e = this.tail;
    for (let i = t; i; i = i.prev) {
      let r = i.prev;
      i.prev = i.next, i.next = r;
    }
    return this.head = e, this.tail = t, this;
  }
};
function Bn(s3, t, e) {
  let i = t, r = t ? t.next : s3.head, n = new ue(e, i, r, s3);
  return n.next === void 0 && (s3.tail = n), n.prev === void 0 && (s3.head = n), s3.length++, n;
}
function Pn(s3, t) {
  s3.tail = new ue(t, s3.tail, void 0, s3), s3.head || (s3.head = s3.tail), s3.length++;
}
function zn(s3, t) {
  s3.head = new ue(t, void 0, s3.head, s3), s3.tail || (s3.tail = s3.head), s3.length++;
}
var ue = class {
  list;
  next;
  prev;
  value;
  constructor(t, e, i, r) {
    this.list = r, this.value = t, e ? (e.next = this, this.prev = e) : this.prev = void 0, i ? (i.prev = this, this.next = i) : this.next = void 0;
  }
};
var di = class {
  path;
  absolute;
  entry;
  stat;
  readdir;
  pending = false;
  ignore = false;
  piped = false;
  constructor(t, e) {
    this.path = t || "./", this.absolute = e;
  }
};
var tr = Buffer.alloc(1024);
var oi = Symbol("onStat");
var me = Symbol("ended");
var W = Symbol("queue");
var Ct = Symbol("current");
var Ft = Symbol("process");
var pe = Symbol("processing");
var rs = Symbol("processJob");
var G = Symbol("jobs");
var ns = Symbol("jobDone");
var hi = Symbol("addFSEntry");
var er = Symbol("addTarEntry");
var as = Symbol("stat");
var ls = Symbol("readdir");
var ai = Symbol("onreaddir");
var li = Symbol("pipe");
var ir = Symbol("entry");
var os = Symbol("entryOpt");
var ci = Symbol("writeEntryClass");
var rr = Symbol("write");
var hs = Symbol("ondrain");
var Et = class extends D {
  sync = false;
  opt;
  cwd;
  maxReadSize;
  preservePaths;
  strict;
  noPax;
  prefix;
  linkCache;
  statCache;
  file;
  portable;
  zip;
  readdirCache;
  noDirRecurse;
  follow;
  noMtime;
  mtime;
  filter;
  jobs;
  [ci];
  onWriteEntry;
  [W];
  [G] = 0;
  [pe] = false;
  [me] = false;
  constructor(t = {}) {
    if (super(), this.opt = t, this.file = t.file || "", this.cwd = t.cwd || process.cwd(), this.maxReadSize = t.maxReadSize, this.preservePaths = !!t.preservePaths, this.strict = !!t.strict, this.noPax = !!t.noPax, this.prefix = f(t.prefix || ""), this.linkCache = t.linkCache || /* @__PURE__ */ new Map(), this.statCache = t.statCache || /* @__PURE__ */ new Map(), this.readdirCache = t.readdirCache || /* @__PURE__ */ new Map(), this.onWriteEntry = t.onWriteEntry, this[ci] = de, typeof t.onwarn == "function" && this.on("warn", t.onwarn), this.portable = !!t.portable, t.gzip || t.brotli || t.zstd) {
      if ((t.gzip ? 1 : 0) + (t.brotli ? 1 : 0) + (t.zstd ? 1 : 0) > 1) throw new TypeError("gzip, brotli, zstd are mutually exclusive");
      if (t.gzip && (typeof t.gzip != "object" && (t.gzip = {}), this.portable && (t.gzip.portable = true), this.zip = new Pe(t.gzip)), t.brotli && (typeof t.brotli != "object" && (t.brotli = {}), this.zip = new He(t.brotli)), t.zstd && (typeof t.zstd != "object" && (t.zstd = {}), this.zip = new Ze(t.zstd)), !this.zip) throw new Error("impossible");
      let e = this.zip;
      e.on("data", (i) => super.write(i)), e.on("end", () => super.end()), e.on("drain", () => this[hs]()), this.on("resume", () => e.resume());
    } else this.on("drain", this[hs]);
    this.noDirRecurse = !!t.noDirRecurse, this.follow = !!t.follow, this.noMtime = !!t.noMtime, t.mtime && (this.mtime = t.mtime), this.filter = typeof t.filter == "function" ? t.filter : () => true, this[W] = new ni(), this[G] = 0, this.jobs = Number(t.jobs) || 4, this[pe] = false, this[me] = false;
  }
  [rr](t) {
    return super.write(t);
  }
  add(t) {
    return this.write(t), this;
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, t = void 0), typeof e == "function" && (i = e, e = void 0), t && this.add(t), this[me] = true, this[Ft](), i && i(), this;
  }
  write(t) {
    if (this[me]) throw new Error("write after end");
    return t instanceof Yt ? this[er](t) : this[hi](t), this.flowing;
  }
  [er](t) {
    let e = f(sr.resolve(this.cwd, t.path));
    if (!this.filter(t.path, t)) t.resume();
    else {
      let i = new di(t.path, e);
      i.entry = new ri(t, this[os](i)), i.entry.on("end", () => this[ns](i)), this[G] += 1, this[W].push(i);
    }
    this[Ft]();
  }
  [hi](t) {
    let e = f(sr.resolve(this.cwd, t));
    this[W].push(new di(t, e)), this[Ft]();
  }
  [as](t) {
    t.pending = true, this[G] += 1;
    let e = this.follow ? "stat" : "lstat";
    fi[e](t.absolute, (i, r) => {
      t.pending = false, this[G] -= 1, i ? this.emit("error", i) : this[oi](t, r);
    });
  }
  [oi](t, e) {
    this.statCache.set(t.absolute, e), t.stat = e, this.filter(t.path, e) ? e.isFile() && e.nlink > 1 && t === this[Ct] && !this.linkCache.get(`${e.dev}:${e.ino}`) && !this.sync && this[rs](t) : t.ignore = true, this[Ft]();
  }
  [ls](t) {
    t.pending = true, this[G] += 1, fi.readdir(t.absolute, (e, i) => {
      if (t.pending = false, this[G] -= 1, e) return this.emit("error", e);
      this[ai](t, i);
    });
  }
  [ai](t, e) {
    this.readdirCache.set(t.absolute, e), t.readdir = e, this[Ft]();
  }
  [Ft]() {
    if (!this[pe]) {
      this[pe] = true;
      for (let t = this[W].head; t && this[G] < this.jobs; t = t.next) if (this[rs](t.value), t.value.ignore) {
        let e = t.next;
        this[W].removeNode(t), t.next = e;
      }
      this[pe] = false, this[me] && this[W].length === 0 && this[G] === 0 && (this.zip ? this.zip.end(tr) : (super.write(tr), super.end()));
    }
  }
  get [Ct]() {
    return this[W] && this[W].head && this[W].head.value;
  }
  [ns](t) {
    this[W].shift(), this[G] -= 1, this[Ft]();
  }
  [rs](t) {
    if (!t.pending) {
      if (t.entry) {
        t === this[Ct] && !t.piped && this[li](t);
        return;
      }
      if (!t.stat) {
        let e = this.statCache.get(t.absolute);
        e ? this[oi](t, e) : this[as](t);
      }
      if (t.stat && !t.ignore) {
        if (!this.noDirRecurse && t.stat.isDirectory() && !t.readdir) {
          let e = this.readdirCache.get(t.absolute);
          if (e ? this[ai](t, e) : this[ls](t), !t.readdir) return;
        }
        if (t.entry = this[ir](t), !t.entry) {
          t.ignore = true;
          return;
        }
        t === this[Ct] && !t.piped && this[li](t);
      }
    }
  }
  [os](t) {
    return { onwarn: (e, i, r) => this.warn(e, i, r), noPax: this.noPax, cwd: this.cwd, absolute: t.absolute, preservePaths: this.preservePaths, maxReadSize: this.maxReadSize, strict: this.strict, portable: this.portable, linkCache: this.linkCache, statCache: this.statCache, noMtime: this.noMtime, mtime: this.mtime, prefix: this.prefix, onWriteEntry: this.onWriteEntry };
  }
  [ir](t) {
    this[G] += 1;
    try {
      return new this[ci](t.path, this[os](t)).on("end", () => this[ns](t)).on("error", (i) => this.emit("error", i));
    } catch (e) {
      this.emit("error", e);
    }
  }
  [hs]() {
    this[Ct] && this[Ct].entry && this[Ct].entry.resume();
  }
  [li](t) {
    t.piped = true, t.readdir && t.readdir.forEach((r) => {
      let n = t.path, o = n === "./" ? "" : n.replace(/\/*$/, "/");
      this[hi](o + r);
    });
    let e = t.entry, i = this.zip;
    if (!e) throw new Error("cannot pipe without source");
    i ? e.on("data", (r) => {
      i.write(r) || e.pause();
    }) : e.on("data", (r) => {
      super.write(r) || e.pause();
    });
  }
  pause() {
    return this.zip && this.zip.pause(), super.pause();
  }
  warn(t, e, i = {}) {
    Lt(this, t, e, i);
  }
};
var kt = class extends Et {
  sync = true;
  constructor(t) {
    super(t), this[ci] = si;
  }
  pause() {
  }
  resume() {
  }
  [as](t) {
    let e = this.follow ? "statSync" : "lstatSync";
    this[oi](t, fi[e](t.absolute));
  }
  [ls](t) {
    this[ai](t, fi.readdirSync(t.absolute));
  }
  [li](t) {
    let e = t.entry, i = this.zip;
    if (t.readdir && t.readdir.forEach((r) => {
      let n = t.path, o = n === "./" ? "" : n.replace(/\/*$/, "/");
      this[hi](o + r);
    }), !e) throw new Error("Cannot pipe without source");
    i ? e.on("data", (r) => {
      i.write(r);
    }) : e.on("data", (r) => {
      super[rr](r);
    });
  }
};
var Un = (s3, t) => {
  let e = new kt(s3), i = new Wt(s3.file, { mode: s3.mode || 438 });
  e.pipe(i), or(e, t);
};
var Hn = (s3, t) => {
  let e = new Et(s3), i = new tt(s3.file, { mode: s3.mode || 438 });
  e.pipe(i);
  let r = new Promise((n, o) => {
    i.on("error", o), i.on("close", n), e.on("error", o);
  });
  return hr(e, t).catch((n) => e.emit("error", n)), r;
};
var or = (s3, t) => {
  t.forEach((e) => {
    e.charAt(0) === "@" ? It({ file: nr.resolve(s3.cwd, e.slice(1)), sync: true, noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  }), s3.end();
};
var hr = async (s3, t) => {
  for (let e of t) e.charAt(0) === "@" ? await It({ file: nr.resolve(String(s3.cwd), e.slice(1)), noResume: true, onReadEntry: (i) => {
    s3.add(i);
  } }) : s3.add(e);
  s3.end();
};
var Wn = (s3, t) => {
  let e = new kt(s3);
  return or(e, t), e;
};
var Gn = (s3, t) => {
  let e = new Et(s3);
  return hr(e, t).catch((i) => e.emit("error", i)), e;
};
var Zn = K(Un, Hn, Wn, Gn, (s3, t) => {
  if (!t?.length) throw new TypeError("no paths specified to add to archive");
});
var Yn = process.env.__FAKE_PLATFORM__ || process.platform;
var fr = Yn === "win32";
var { O_CREAT: dr, O_NOFOLLOW: ar, O_TRUNC: ur, O_WRONLY: mr } = cr.constants;
var pr = Number(process.env.__FAKE_FS_O_FILENAME__) || cr.constants.UV_FS_O_FILEMAP || 0;
var Kn = fr && !!pr;
var Vn = 512 * 1024;
var $n = pr | ur | dr | mr;
var lr = !fr && typeof ar == "number" ? ar | ur | dr | mr : null;
var cs = lr !== null ? () => lr : Kn ? (s3) => s3 < Vn ? $n : "w" : () => "w";
var fs = (s3, t, e) => {
  try {
    return mi.lchownSync(s3, t, e);
  } catch (i) {
    if (i?.code !== "ENOENT") throw i;
  }
};
var ui = (s3, t, e, i) => {
  mi.lchown(s3, t, e, (r) => {
    i(r && r?.code !== "ENOENT" ? r : null);
  });
};
var Xn = (s3, t, e, i, r) => {
  if (t.isDirectory()) ds(Ee.resolve(s3, t.name), e, i, (n) => {
    if (n) return r(n);
    let o = Ee.resolve(s3, t.name);
    ui(o, e, i, r);
  });
  else {
    let n = Ee.resolve(s3, t.name);
    ui(n, e, i, r);
  }
};
var ds = (s3, t, e, i) => {
  mi.readdir(s3, { withFileTypes: true }, (r, n) => {
    if (r) {
      if (r.code === "ENOENT") return i();
      if (r.code !== "ENOTDIR" && r.code !== "ENOTSUP") return i(r);
    }
    if (r || !n.length) return ui(s3, t, e, i);
    let o = n.length, h = null, a = (l) => {
      if (!h) {
        if (l) return i(h = l);
        if (--o === 0) return ui(s3, t, e, i);
      }
    };
    for (let l of n) Xn(s3, l, t, e, a);
  });
};
var qn = (s3, t, e, i) => {
  t.isDirectory() && us(Ee.resolve(s3, t.name), e, i), fs(Ee.resolve(s3, t.name), e, i);
};
var us = (s3, t, e) => {
  let i;
  try {
    i = mi.readdirSync(s3, { withFileTypes: true });
  } catch (r) {
    let n = r;
    if (n?.code === "ENOENT") return;
    if (n?.code === "ENOTDIR" || n?.code === "ENOTSUP") return fs(s3, t, e);
    throw n;
  }
  for (let r of i) qn(s3, r, t, e);
  return fs(s3, t, e);
};
var we = class extends Error {
  path;
  code;
  syscall = "chdir";
  constructor(t, e) {
    super(`${e}: Cannot cd into '${t}'`), this.path = t, this.code = e;
  }
  get name() {
    return "CwdError";
  }
};
var wt = class extends Error {
  path;
  symlink;
  syscall = "symlink";
  code = "TAR_SYMLINK_ERROR";
  constructor(t, e) {
    super("TAR_SYMLINK_ERROR: Cannot extract through symbolic link"), this.symlink = t, this.path = e;
  }
  get name() {
    return "SymlinkError";
  }
};
var Qn = (s3, t) => {
  k.stat(s3, (e, i) => {
    (e || !i.isDirectory()) && (e = new we(s3, e?.code || "ENOTDIR")), t(e);
  });
};
var Er = (s3, t, e) => {
  s3 = f(s3);
  let i = t.umask ?? 18, r = t.mode | 448, n = (r & i) !== 0, o = t.uid, h = t.gid, a = typeof o == "number" && typeof h == "number" && (o !== t.processUid || h !== t.processGid), l = t.preserve, c = t.unlink, d = f(t.cwd), S = (E, x) => {
    E ? e(E) : x && a ? ds(x, o, h, (xe) => S(xe)) : n ? k.chmod(s3, r, e) : e();
  };
  if (s3 === d) return Qn(s3, S);
  if (l) return jn.mkdir(s3, { mode: r, recursive: true }).then((E) => S(null, E ?? void 0), S);
  let N = f(pi.relative(d, s3)).split("/");
  ms(d, N, r, c, d, void 0, S);
};
var ms = (s3, t, e, i, r, n, o) => {
  if (t.length === 0) return o(null, n);
  let h = t.shift(), a = f(pi.resolve(s3 + "/" + h));
  k.mkdir(a, e, wr(a, t, e, i, r, n, o));
};
var wr = (s3, t, e, i, r, n, o) => (h) => {
  h ? k.lstat(s3, (a, l) => {
    if (a) a.path = a.path && f(a.path), o(a);
    else if (l.isDirectory()) ms(s3, t, e, i, r, n, o);
    else if (i) k.unlink(s3, (c) => {
      if (c) return o(c);
      k.mkdir(s3, e, wr(s3, t, e, i, r, n, o));
    });
    else {
      if (l.isSymbolicLink()) return o(new wt(s3, s3 + "/" + t.join("/")));
      o(h);
    }
  }) : (n = n || s3, ms(s3, t, e, i, r, n, o));
};
var Jn = (s3) => {
  let t = false, e;
  try {
    t = k.statSync(s3).isDirectory();
  } catch (i) {
    e = i?.code;
  } finally {
    if (!t) throw new we(s3, e ?? "ENOTDIR");
  }
};
var Sr = (s3, t) => {
  s3 = f(s3);
  let e = t.umask ?? 18, i = t.mode | 448, r = (i & e) !== 0, n = t.uid, o = t.gid, h = typeof n == "number" && typeof o == "number" && (n !== t.processUid || o !== t.processGid), a = t.preserve, l = t.unlink, c = f(t.cwd), d = (E) => {
    E && h && us(E, n, o), r && k.chmodSync(s3, i);
  };
  if (s3 === c) return Jn(c), d();
  if (a) return d(k.mkdirSync(s3, { mode: i, recursive: true }) ?? void 0);
  let T = f(pi.relative(c, s3)).split("/"), N;
  for (let E = T.shift(), x = c; E && (x += "/" + E); E = T.shift()) {
    x = f(pi.resolve(x));
    try {
      k.mkdirSync(x, i), N = N || x;
    } catch {
      let xe = k.lstatSync(x);
      if (xe.isDirectory()) continue;
      if (l) {
        k.unlinkSync(x), k.mkdirSync(x, i), N = N || x;
        continue;
      } else if (xe.isSymbolicLink()) return new wt(x, x + "/" + T.join("/"));
    }
  }
  return d(N);
};
var ps = /* @__PURE__ */ Object.create(null);
var yr = 1e4;
var $t = /* @__PURE__ */ new Set();
var Rr = (s3) => {
  $t.has(s3) ? $t.delete(s3) : ps[s3] = s3.normalize("NFD").toLocaleLowerCase("en").toLocaleUpperCase("en"), $t.add(s3);
  let t = ps[s3], e = $t.size - yr;
  if (e > yr / 10) {
    for (let i of $t) if ($t.delete(i), delete ps[i], --e <= 0) break;
  }
  return t;
};
var to = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var eo = to === "win32";
var io = (s3) => s3.split("/").slice(0, -1).reduce((e, i) => {
  let r = e.at(-1);
  return r !== void 0 && (i = br(r, i)), e.push(i || "/"), e;
}, []);
var Ei = class {
  #t = /* @__PURE__ */ new Map();
  #i = /* @__PURE__ */ new Map();
  #s = /* @__PURE__ */ new Set();
  reserve(t, e) {
    t = eo ? ["win32 parallelization disabled"] : t.map((r) => mt(br(Rr(r))));
    let i = new Set(t.map((r) => io(r)).reduce((r, n) => r.concat(n)));
    this.#i.set(e, { dirs: i, paths: t });
    for (let r of t) {
      let n = this.#t.get(r);
      n ? n.push(e) : this.#t.set(r, [e]);
    }
    for (let r of i) {
      let n = this.#t.get(r);
      if (!n) this.#t.set(r, [/* @__PURE__ */ new Set([e])]);
      else {
        let o = n.at(-1);
        o instanceof Set ? o.add(e) : n.push(/* @__PURE__ */ new Set([e]));
      }
    }
    return this.#r(e);
  }
  #n(t) {
    let e = this.#i.get(t);
    if (!e) throw new Error("function does not have any path reservations");
    return { paths: e.paths.map((i) => this.#t.get(i)), dirs: [...e.dirs].map((i) => this.#t.get(i)) };
  }
  check(t) {
    let { paths: e, dirs: i } = this.#n(t);
    return e.every((r) => r && r[0] === t) && i.every((r) => r && r[0] instanceof Set && r[0].has(t));
  }
  #r(t) {
    return this.#s.has(t) || !this.check(t) ? false : (this.#s.add(t), t(() => this.#e(t)), true);
  }
  #e(t) {
    if (!this.#s.has(t)) return false;
    let e = this.#i.get(t);
    if (!e) throw new Error("invalid reservation");
    let { paths: i, dirs: r } = e, n = /* @__PURE__ */ new Set();
    for (let o of i) {
      let h = this.#t.get(o);
      if (!h || h?.[0] !== t) continue;
      let a = h[1];
      if (!a) {
        this.#t.delete(o);
        continue;
      }
      if (h.shift(), typeof a == "function") n.add(a);
      else for (let l of a) n.add(l);
    }
    for (let o of r) {
      let h = this.#t.get(o), a = h?.[0];
      if (!(!h || !(a instanceof Set))) if (a.size === 1 && h.length === 1) {
        this.#t.delete(o);
        continue;
      } else if (a.size === 1) {
        h.shift();
        let l = h[0];
        typeof l == "function" && n.add(l);
      } else a.delete(t);
    }
    return this.#s.delete(t), n.forEach((o) => this.#r(o)), true;
  }
};
var _r = () => process.umask();
var gr = Symbol("onEntry");
var ys = Symbol("checkFs");
var Or = Symbol("checkFs2");
var Rs = Symbol("isReusable");
var P = Symbol("makeFs");
var bs = Symbol("file");
var _s = Symbol("directory");
var Si = Symbol("link");
var Tr = Symbol("symlink");
var xr = Symbol("hardlink");
var ye = Symbol("ensureNoSymlink");
var Lr = Symbol("unsupported");
var Nr = Symbol("checkPath");
var Es = Symbol("stripAbsolutePath");
var St = Symbol("mkdir");
var O = Symbol("onError");
var wi = Symbol("pending");
var Ar = Symbol("pend");
var Xt = Symbol("unpend");
var ws = Symbol("ended");
var Ss = Symbol("maybeClose");
var gs = Symbol("skip");
var Re = Symbol("doChown");
var be = Symbol("uid");
var _e = Symbol("gid");
var ge = Symbol("checkedCwd");
var ro = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var Oe = ro === "win32";
var no = 1024;
var oo = (s3, t) => {
  if (!Oe) return u.unlink(s3, t);
  let e = s3 + ".DELETE." + Ir(16).toString("hex");
  u.rename(s3, e, (i) => {
    if (i) return t(i);
    u.unlink(e, t);
  });
};
var ho = (s3) => {
  if (!Oe) return u.unlinkSync(s3);
  let t = s3 + ".DELETE." + Ir(16).toString("hex");
  u.renameSync(s3, t), u.unlinkSync(t);
};
var Dr = (s3, t, e) => s3 !== void 0 && s3 === s3 >>> 0 ? s3 : t !== void 0 && t === t >>> 0 ? t : e;
var qt = class extends st {
  [ws] = false;
  [ge] = false;
  [wi] = 0;
  reservations = new Ei();
  transform;
  writable = true;
  readable = false;
  uid;
  gid;
  setOwner;
  preserveOwner;
  processGid;
  processUid;
  maxDepth;
  forceChown;
  win32;
  newer;
  keep;
  noMtime;
  preservePaths;
  unlink;
  cwd;
  strip;
  processUmask;
  umask;
  dmode;
  fmode;
  chmod;
  constructor(t = {}) {
    if (t.ondone = () => {
      this[ws] = true, this[Ss]();
    }, super(t), this.transform = t.transform, this.chmod = !!t.chmod, typeof t.uid == "number" || typeof t.gid == "number") {
      if (typeof t.uid != "number" || typeof t.gid != "number") throw new TypeError("cannot set owner without number uid and gid");
      if (t.preserveOwner) throw new TypeError("cannot preserve owner in archive and also set owner explicitly");
      this.uid = t.uid, this.gid = t.gid, this.setOwner = true;
    } else this.uid = void 0, this.gid = void 0, this.setOwner = false;
    this.preserveOwner = t.preserveOwner === void 0 && typeof t.uid != "number" ? !!(process.getuid && process.getuid() === 0) : !!t.preserveOwner, this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ? process.getuid() : void 0, this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ? process.getgid() : void 0, this.maxDepth = typeof t.maxDepth == "number" ? t.maxDepth : no, this.forceChown = t.forceChown === true, this.win32 = !!t.win32 || Oe, this.newer = !!t.newer, this.keep = !!t.keep, this.noMtime = !!t.noMtime, this.preservePaths = !!t.preservePaths, this.unlink = !!t.unlink, this.cwd = f(R.resolve(t.cwd || process.cwd())), this.strip = Number(t.strip) || 0, this.processUmask = this.chmod ? typeof t.processUmask == "number" ? t.processUmask : _r() : 0, this.umask = typeof t.umask == "number" ? t.umask : this.processUmask, this.dmode = t.dmode || 511 & ~this.umask, this.fmode = t.fmode || 438 & ~this.umask, this.on("entry", (e) => this[gr](e));
  }
  warn(t, e, i = {}) {
    return (t === "TAR_BAD_ARCHIVE" || t === "TAR_ABORT") && (i.recoverable = false), super.warn(t, e, i);
  }
  [Ss]() {
    this[ws] && this[wi] === 0 && (this.emit("prefinish"), this.emit("finish"), this.emit("end"));
  }
  [Es](t, e) {
    let i = t[e], { type: r } = t;
    if (!i || this.preservePaths) return true;
    let [n, o] = ce(i), h = o.replaceAll(/\\/g, "/").split("/");
    if (h.includes("..") || Oe && /^[a-z]:\.\.$/i.test(h[0] ?? "")) {
      if (e === "path" || r === "Link") return this.warn("TAR_ENTRY_ERROR", `${e} contains '..'`, { entry: t, [e]: i }), false;
      let a = R.posix.dirname(t.path), l = R.posix.normalize(R.posix.join(a, h.join("/")));
      if (l.startsWith("../") || l === "..") return this.warn("TAR_ENTRY_ERROR", `${e} escapes extraction directory`, { entry: t, [e]: i }), false;
    }
    return n && (t[e] = String(o), this.warn("TAR_ENTRY_INFO", `stripping ${n} from absolute ${e}`, { entry: t, [e]: i })), true;
  }
  [Nr](t) {
    let e = f(t.path), i = e.split("/");
    if (this.strip) {
      if (i.length < this.strip) return false;
      if (t.type === "Link") {
        let r = f(String(t.linkpath)).split("/");
        if (r.length >= this.strip) t.linkpath = r.slice(this.strip).join("/");
        else return false;
      }
      i.splice(0, this.strip), t.path = i.join("/");
    }
    if (isFinite(this.maxDepth) && i.length > this.maxDepth) return this.warn("TAR_ENTRY_ERROR", "path excessively deep", { entry: t, path: e, depth: i.length, maxDepth: this.maxDepth }), false;
    if (!this[Es](t, "path") || !this[Es](t, "linkpath")) return false;
    if (t.absolute = R.isAbsolute(t.path) ? f(R.resolve(t.path)) : f(R.resolve(this.cwd, t.path)), !this.preservePaths && typeof t.absolute == "string" && t.absolute.indexOf(this.cwd + "/") !== 0 && t.absolute !== this.cwd) return this.warn("TAR_ENTRY_ERROR", "path escaped extraction target", { entry: t, path: f(t.path), resolvedPath: t.absolute, cwd: this.cwd }), false;
    if (t.absolute === this.cwd && t.type !== "Directory" && t.type !== "GNUDumpDir") return false;
    if (this.win32) {
      let { root: r } = R.win32.parse(String(t.absolute));
      t.absolute = r + Xi(String(t.absolute).slice(r.length));
      let { root: n } = R.win32.parse(t.path);
      t.path = n + Xi(t.path.slice(n.length));
    }
    return true;
  }
  [gr](t) {
    if (!this[Nr](t)) return t.resume();
    switch (so.equal(typeof t.absolute, "string"), t.type) {
      case "Directory":
      case "GNUDumpDir":
        t.mode && (t.mode = t.mode | 448);
      case "File":
      case "OldFile":
      case "ContiguousFile":
      case "Link":
      case "SymbolicLink":
        return this[ys](t);
      default:
        return this[Lr](t);
    }
  }
  [O](t, e) {
    t.name === "CwdError" ? this.emit("error", t) : (this.warn("TAR_ENTRY_ERROR", t, { entry: e }), this[Xt](), e.resume());
  }
  [St](t, e, i) {
    Er(f(t), { uid: this.uid, gid: this.gid, processUid: this.processUid, processGid: this.processGid, umask: this.processUmask, preserve: this.preservePaths, unlink: this.unlink, cwd: this.cwd, mode: e }, i);
  }
  [Re](t) {
    return this.forceChown || this.preserveOwner && (typeof t.uid == "number" && t.uid !== this.processUid || typeof t.gid == "number" && t.gid !== this.processGid) || typeof this.uid == "number" && this.uid !== this.processUid || typeof this.gid == "number" && this.gid !== this.processGid;
  }
  [be](t) {
    return Dr(this.uid, t.uid, this.processUid);
  }
  [_e](t) {
    return Dr(this.gid, t.gid, this.processGid);
  }
  [bs](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.fmode, r = new tt(String(t.absolute), { flags: cs(t.size), mode: i, autoClose: false });
    r.on("error", (a) => {
      r.fd && u.close(r.fd, () => {
      }), r.write = () => true, this[O](a, t), e();
    });
    let n = 1, o = (a) => {
      if (a) {
        r.fd && u.close(r.fd, () => {
        }), this[O](a, t), e();
        return;
      }
      --n === 0 && r.fd !== void 0 && u.close(r.fd, (l) => {
        l ? this[O](l, t) : this[Xt](), e();
      });
    };
    r.on("finish", () => {
      let a = String(t.absolute), l = r.fd;
      if (typeof l == "number" && t.mtime && !this.noMtime) {
        n++;
        let c = t.atime || /* @__PURE__ */ new Date(), d = t.mtime;
        u.futimes(l, c, d, (S) => S ? u.utimes(a, c, d, (T) => o(T && S)) : o());
      }
      if (typeof l == "number" && this[Re](t)) {
        n++;
        let c = this[be](t), d = this[_e](t);
        typeof c == "number" && typeof d == "number" && u.fchown(l, c, d, (S) => S ? u.chown(a, c, d, (T) => o(T && S)) : o());
      }
      o();
    });
    let h = this.transform && this.transform(t) || t;
    h !== t && (h.on("error", (a) => {
      this[O](a, t), e();
    }), t.pipe(h)), h.pipe(r);
  }
  [_s](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.dmode;
    this[St](String(t.absolute), i, (r) => {
      if (r) {
        this[O](r, t), e();
        return;
      }
      let n = 1, o = () => {
        --n === 0 && (e(), this[Xt](), t.resume());
      };
      t.mtime && !this.noMtime && (n++, u.utimes(String(t.absolute), t.atime || /* @__PURE__ */ new Date(), t.mtime, o)), this[Re](t) && (n++, u.chown(String(t.absolute), Number(this[be](t)), Number(this[_e](t)), o)), o();
    });
  }
  [Lr](t) {
    t.unsupported = true, this.warn("TAR_ENTRY_UNSUPPORTED", `unsupported entry type: ${t.type}`, { entry: t }), t.resume();
  }
  [Tr](t, e) {
    let i = f(R.relative(this.cwd, R.resolve(R.dirname(String(t.absolute)), String(t.linkpath)))).split("/");
    this[ye](t, this.cwd, i, () => this[Si](t, String(t.linkpath), "symlink", e), (r) => {
      this[O](r, t), e();
    });
  }
  [xr](t, e) {
    let i = f(R.resolve(this.cwd, String(t.linkpath))), r = f(String(t.linkpath)).split("/");
    this[ye](t, this.cwd, r, () => this[Si](t, i, "link", e), (n) => {
      this[O](n, t), e();
    });
  }
  [ye](t, e, i, r, n) {
    let o = i.shift();
    if (this.preservePaths || o === void 0) return r();
    let h = R.resolve(e, o);
    u.lstat(h, (a, l) => {
      if (a) return r();
      if (l?.isSymbolicLink()) return n(new wt(h, R.resolve(h, i.join("/"))));
      this[ye](t, h, i, r, n);
    });
  }
  [Ar]() {
    this[wi]++;
  }
  [Xt]() {
    this[wi]--, this[Ss]();
  }
  [gs](t) {
    this[Xt](), t.resume();
  }
  [Rs](t, e) {
    return t.type === "File" && !this.unlink && e.isFile() && e.nlink <= 1 && !Oe;
  }
  [ys](t) {
    this[Ar]();
    let e = [t.path];
    t.linkpath && e.push(t.linkpath), this.reservations.reserve(e, (i) => this[Or](t, i));
  }
  [Or](t, e) {
    let i = (h) => {
      e(h);
    }, r = () => {
      this[St](this.cwd, this.dmode, (h) => {
        if (h) {
          this[O](h, t), i();
          return;
        }
        this[ge] = true, n();
      });
    }, n = () => {
      if (t.absolute !== this.cwd) {
        let h = f(R.dirname(String(t.absolute)));
        if (h !== this.cwd) return this[St](h, this.dmode, (a) => {
          if (a) {
            this[O](a, t), i();
            return;
          }
          o();
        });
      }
      o();
    }, o = () => {
      u.lstat(String(t.absolute), (h, a) => {
        if (a && (this.keep || this.newer && a.mtime > (t.mtime ?? a.mtime))) {
          this[gs](t), i();
          return;
        }
        if (h || this[Rs](t, a)) return this[P](null, t, i);
        if (a.isDirectory()) {
          if (t.type === "Directory") {
            let l = this.chmod && t.mode && (a.mode & 4095) !== t.mode, c = (d) => this[P](d ?? null, t, i);
            return l ? u.chmod(String(t.absolute), Number(t.mode), c) : c();
          }
          if (t.absolute !== this.cwd) return u.rmdir(String(t.absolute), (l) => this[P](l ?? null, t, i));
        }
        if (t.absolute === this.cwd) return this[P](null, t, i);
        oo(String(t.absolute), (l) => this[P](l ?? null, t, i));
      });
    };
    this[ge] ? n() : r();
  }
  [P](t, e, i) {
    if (t) {
      this[O](t, e), i();
      return;
    }
    switch (e.type) {
      case "File":
      case "OldFile":
      case "ContiguousFile":
        return this[bs](e, i);
      case "Link":
        return this[xr](e, i);
      case "SymbolicLink":
        return this[Tr](e, i);
      case "Directory":
      case "GNUDumpDir":
        return this[_s](e, i);
    }
  }
  [Si](t, e, i, r) {
    u[i](e, String(t.absolute), (n) => {
      n ? this[O](n, t) : (this[Xt](), t.resume()), r();
    });
  }
};
var Se = (s3) => {
  try {
    return [null, s3()];
  } catch (t) {
    return [t, null];
  }
};
var Te = class extends qt {
  sync = true;
  [P](t, e) {
    return super[P](t, e, () => {
    });
  }
  [ys](t) {
    if (!this[ge]) {
      let n = this[St](this.cwd, this.dmode);
      if (n) return this[O](n, t);
      this[ge] = true;
    }
    if (t.absolute !== this.cwd) {
      let n = f(R.dirname(String(t.absolute)));
      if (n !== this.cwd) {
        let o = this[St](n, this.dmode);
        if (o) return this[O](o, t);
      }
    }
    let [e, i] = Se(() => u.lstatSync(String(t.absolute)));
    if (i && (this.keep || this.newer && i.mtime > (t.mtime ?? i.mtime))) return this[gs](t);
    if (e || this[Rs](t, i)) return this[P](null, t);
    if (i.isDirectory()) {
      if (t.type === "Directory") {
        let o = this.chmod && t.mode && (i.mode & 4095) !== t.mode, [h] = o ? Se(() => {
          u.chmodSync(String(t.absolute), Number(t.mode));
        }) : [];
        return this[P](h, t);
      }
      let [n] = Se(() => u.rmdirSync(String(t.absolute)));
      this[P](n, t);
    }
    let [r] = t.absolute === this.cwd ? [] : Se(() => ho(String(t.absolute)));
    this[P](r, t);
  }
  [bs](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.fmode, r = (h) => {
      let a;
      try {
        u.closeSync(n);
      } catch (l) {
        a = l;
      }
      (h || a) && this[O](h || a, t), e();
    }, n;
    try {
      n = u.openSync(String(t.absolute), cs(t.size), i);
    } catch (h) {
      return r(h);
    }
    let o = this.transform && this.transform(t) || t;
    o !== t && (o.on("error", (h) => this[O](h, t)), t.pipe(o)), o.on("data", (h) => {
      try {
        u.writeSync(n, h, 0, h.length);
      } catch (a) {
        r(a);
      }
    }), o.on("end", () => {
      let h = null;
      if (t.mtime && !this.noMtime) {
        let a = t.atime || /* @__PURE__ */ new Date(), l = t.mtime;
        try {
          u.futimesSync(n, a, l);
        } catch (c) {
          try {
            u.utimesSync(String(t.absolute), a, l);
          } catch {
            h = c;
          }
        }
      }
      if (this[Re](t)) {
        let a = this[be](t), l = this[_e](t);
        try {
          u.fchownSync(n, Number(a), Number(l));
        } catch (c) {
          try {
            u.chownSync(String(t.absolute), Number(a), Number(l));
          } catch {
            h = h || c;
          }
        }
      }
      r(h);
    });
  }
  [_s](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.dmode, r = this[St](String(t.absolute), i);
    if (r) {
      this[O](r, t), e();
      return;
    }
    if (t.mtime && !this.noMtime) try {
      u.utimesSync(String(t.absolute), t.atime || /* @__PURE__ */ new Date(), t.mtime);
    } catch {
    }
    if (this[Re](t)) try {
      u.chownSync(String(t.absolute), Number(this[be](t)), Number(this[_e](t)));
    } catch {
    }
    e(), t.resume();
  }
  [St](t, e) {
    try {
      return Sr(f(t), { uid: this.uid, gid: this.gid, processUid: this.processUid, processGid: this.processGid, umask: this.processUmask, preserve: this.preservePaths, unlink: this.unlink, cwd: this.cwd, mode: e });
    } catch (i) {
      return i;
    }
  }
  [ye](t, e, i, r, n) {
    if (this.preservePaths || i.length === 0) return r();
    let o = e;
    for (let h of i) {
      o = R.resolve(o, h);
      let [a, l] = Se(() => u.lstatSync(o));
      if (a) return r();
      if (l.isSymbolicLink()) return n(new wt(o, R.resolve(e, i.join("/"))));
    }
    r();
  }
  [Si](t, e, i, r) {
    let n = `${i}Sync`;
    try {
      u[n](e, String(t.absolute)), r(), t.resume();
    } catch (o) {
      return this[O](o, t);
    }
  }
};
var ao = (s3) => {
  let t = new Te(s3), e = s3.file, i = Cr.statSync(e), r = s3.maxReadSize || 16 * 1024 * 1024;
  new Me(e, { readSize: r, size: i.size }).pipe(t);
};
var lo = (s3, t) => {
  let e = new qt(s3), i = s3.maxReadSize || 16 * 1024 * 1024, r = s3.file;
  return new Promise((o, h) => {
    e.on("error", h), e.on("close", o), Cr.stat(r, (a, l) => {
      if (a) h(a);
      else {
        let c = new _t(r, { readSize: i, size: l.size });
        c.on("error", h), c.pipe(e);
      }
    });
  });
};
var co = K(ao, lo, (s3) => new Te(s3), (s3) => new qt(s3), (s3, t) => {
  t?.length && Ki(s3, t);
});
var fo = (s3, t) => {
  let e = new kt(s3), i = true, r, n;
  try {
    try {
      r = v.openSync(s3.file, "r+");
    } catch (a) {
      if (a?.code === "ENOENT") r = v.openSync(s3.file, "w+");
      else throw a;
    }
    let o = v.fstatSync(r), h = Buffer.alloc(512);
    t: for (n = 0; n < o.size; n += 512) {
      for (let c = 0, d = 0; c < 512; c += d) {
        if (d = v.readSync(r, h, c, h.length - c, n + c), n === 0 && h[0] === 31 && h[1] === 139) throw new Error("cannot append to compressed archives");
        if (!d) break t;
      }
      let a = new F(h);
      if (!a.cksumValid) break;
      let l = 512 * Math.ceil((a.size || 0) / 512);
      if (n + l + 512 > o.size) break;
      n += l, s3.mtimeCache && a.mtime && s3.mtimeCache.set(String(a.path), a.mtime);
    }
    i = false, uo(s3, e, n, r, t);
  } finally {
    if (i) try {
      v.closeSync(r);
    } catch {
    }
  }
};
var uo = (s3, t, e, i, r) => {
  let n = new Wt(s3.file, { fd: i, start: e });
  t.pipe(n), po(t, r);
};
var mo = (s3, t) => {
  t = Array.from(t);
  let e = new Et(s3), i = (n, o, h) => {
    let a = (T, N) => {
      T ? v.close(n, (E) => h(T)) : h(null, N);
    }, l = 0;
    if (o === 0) return a(null, 0);
    let c = 0, d = Buffer.alloc(512), S = (T, N) => {
      if (T || N === void 0) return a(T);
      if (c += N, c < 512 && N) return v.read(n, d, c, d.length - c, l + c, S);
      if (l === 0 && d[0] === 31 && d[1] === 139) return a(new Error("cannot append to compressed archives"));
      if (c < 512) return a(null, l);
      let E = new F(d);
      if (!E.cksumValid) return a(null, l);
      let x = 512 * Math.ceil((E.size ?? 0) / 512);
      if (l + x + 512 > o || (l += x + 512, l >= o)) return a(null, l);
      s3.mtimeCache && E.mtime && s3.mtimeCache.set(String(E.path), E.mtime), c = 0, v.read(n, d, 0, 512, l, S);
    };
    v.read(n, d, 0, 512, l, S);
  };
  return new Promise((n, o) => {
    e.on("error", o);
    let h = "r+", a = (l, c) => {
      if (l && l.code === "ENOENT" && h === "r+") return h = "w+", v.open(s3.file, h, a);
      if (l || !c) return o(l);
      v.fstat(c, (d, S) => {
        if (d) return v.close(c, () => o(d));
        i(c, S.size, (T, N) => {
          if (T) return o(T);
          let E = new tt(s3.file, { fd: c, start: N });
          e.pipe(E), E.on("error", o), E.on("close", n), Eo(e, t);
        });
      });
    };
    v.open(s3.file, h, a);
  });
};
var po = (s3, t) => {
  t.forEach((e) => {
    e.charAt(0) === "@" ? It({ file: Fr.resolve(s3.cwd, e.slice(1)), sync: true, noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  }), s3.end();
};
var Eo = async (s3, t) => {
  for (let e of t) e.charAt(0) === "@" ? await It({ file: Fr.resolve(String(s3.cwd), e.slice(1)), noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  s3.end();
};
var vt = K(fo, mo, () => {
  throw new TypeError("file is required");
}, () => {
  throw new TypeError("file is required");
}, (s3, t) => {
  if (!Fs(s3)) throw new TypeError("file is required");
  if (s3.gzip || s3.brotli || s3.zstd || s3.file.endsWith(".br") || s3.file.endsWith(".tbr")) throw new TypeError("cannot append to compressed archives");
  if (!t?.length) throw new TypeError("no paths specified to add/replace");
});
var wo = K(vt.syncFile, vt.asyncFile, vt.syncNoFile, vt.asyncNoFile, (s3, t = []) => {
  vt.validate?.(s3, t), So(s3);
});
var So = (s3) => {
  let t = s3.filter;
  s3.mtimeCache || (s3.mtimeCache = /* @__PURE__ */ new Map()), s3.filter = t ? (e, i) => t(e, i) && !((s3.mtimeCache?.get(e) ?? i.mtime ?? 0) > (i.mtime ?? 0)) : (e, i) => !((s3.mtimeCache?.get(e) ?? i.mtime ?? 0) > (i.mtime ?? 0));
};

// dist/src/hooks/comment-checker/downloader.js
var MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
var DEFAULT_RELEASE_VERSION = "0.7.0";
var RELEASE_REPOSITORY = "code-yeongyu/go-claude-code-comment-checker";
async function downloadCommentCheckerBinary(options) {
  if (options.pluginDataDir === void 0 || options.signal.aborted) {
    return null;
  }
  let tempRoot;
  try {
    const platform = options.platform ?? process.platform;
    const arch = options.arch ?? process.arch;
    const customAssetUrl = cleanOptionalUrl(options.assetUrl);
    const defaultAsset = customAssetUrl === void 0 ? resolveDefaultCommentCheckerAsset(platform, arch) : void 0;
    const assetUrl = customAssetUrl ?? defaultAsset?.url;
    const expectedSha256 = customAssetUrl === void 0 ? defaultAsset?.expectedSha256 : options.expectedSha256;
    if (assetUrl === void 0 || assetUrl.endsWith(".zip")) {
      return null;
    }
    const binDir = join5(options.pluginDataDir, "comment-checker", "bin");
    const binaryPath = getCachedCommentCheckerBinaryPath(options.pluginDataDir, platform);
    mkdirSync2(dirname2(binaryPath), { recursive: true });
    if (await isSafeExecutable(binaryPath)) {
      return binaryPath;
    }
    if (!await isAbsentOrSafeRegularPath(binaryPath)) {
      return null;
    }
    tempRoot = await makeTempDir(binDir);
    const response = await abortable((options.fetch ?? fetch)(assetUrl, { signal: options.signal }), options.signal);
    if (!response.ok || options.signal.aborted) {
      return null;
    }
    if (isOversizedResponse(response)) {
      return null;
    }
    const buffer = Buffer.from(await abortable(response.arrayBuffer(), options.signal));
    if (options.signal.aborted || buffer.byteLength > MAX_DOWNLOAD_BYTES) {
      return null;
    }
    if (!matchesExpectedSha256(buffer, expectedSha256)) {
      return null;
    }
    const archivePath = join5(tempRoot, "comment-checker.tar.gz");
    writeFileSync2(archivePath, buffer);
    const extractedPath = await extractSafeBinary({ archivePath, tempRoot, binDir, binaryName: basename2(binaryPath), signal: options.signal });
    if (extractedPath === null || options.signal.aborted) {
      return null;
    }
    if (!await isSafeRegularPath(extractedPath)) {
      return null;
    }
    const tempBinaryPath = join5(binDir, `.comment-checker-${process.pid}-${Date.now()}`);
    const binary = await readFile(extractedPath);
    await writeFreshTempBinary(tempBinaryPath, binary);
    if (!await isSafeRegularPath(tempBinaryPath) || !await isAbsentOrSafeRegularPath(binaryPath)) {
      await rm(tempBinaryPath, { force: true }).catch(() => void 0);
      return null;
    }
    await chmod(tempBinaryPath, 493);
    await rename(tempBinaryPath, binaryPath);
    if (!await isSafeRegularPath(binaryPath)) {
      return null;
    }
    return await isExecutable2(binaryPath) ? binaryPath : null;
  } catch {
    return null;
  } finally {
    if (tempRoot !== void 0) {
      await rm(tempRoot, { recursive: true, force: true }).catch(() => void 0);
    }
  }
}
function resolveDefaultCommentCheckerAsset(platform, arch) {
  if (platform === "win32") {
    return void 0;
  }
  const platformName = platform === "darwin" ? "darwin" : platform === "linux" ? "linux" : void 0;
  const archName = arch === "x64" ? "amd64" : arch === "arm64" ? "arm64" : void 0;
  if (platformName === void 0 || archName === void 0) {
    return void 0;
  }
  const expectedSha256 = resolveDefaultCommentCheckerSha256(platform, arch);
  if (expectedSha256 === void 0) {
    return void 0;
  }
  return {
    url: `https://github.com/${RELEASE_REPOSITORY}/releases/download/v${DEFAULT_RELEASE_VERSION}/comment-checker_v${DEFAULT_RELEASE_VERSION}_${platformName}_${archName}.tar.gz`,
    expectedSha256
  };
}
function resolveDefaultCommentCheckerSha256(platform, arch) {
  if (platform === "darwin" && arch === "x64") {
    return "e64dc7bcab5cdeab7ec9d443ad94740fa96eb6b9c1e3208548250a2d4702b91d";
  }
  if (platform === "darwin" && arch === "arm64") {
    return "d30a1e4cdc7b317ada2acb21241eda4e4a677e2f46427f5d244cbefd551f0d7f";
  }
  if (platform === "linux" && arch === "x64") {
    return "60b98741cd1b06acb247d2d746dda4ff15992e91e39dad2dc0db016ebd655646";
  }
  if (platform === "linux" && arch === "arm64") {
    return "477317e4beadfe9965091115adde78a8114c644b2269099e1bfd0456ee95c231";
  }
  return void 0;
}
async function makeTempDir(binDir) {
  mkdirSync2(binDir, { recursive: true });
  return mkdtemp(join5(binDir, ".download-"));
}
async function abortable(promise, signal) {
  if (signal.aborted) {
    throw new Error("aborted");
  }
  let abortListener;
  try {
    return await Promise.race([
      promise,
      new Promise((_resolve, reject) => {
        abortListener = () => reject(new Error("aborted"));
        signal.addEventListener("abort", abortListener, { once: true });
      })
    ]);
  } finally {
    if (abortListener !== void 0) {
      signal.removeEventListener("abort", abortListener);
    }
  }
}
async function extractSafeBinary(options) {
  let extractedPath = null;
  const extractDir = join5(options.tempRoot, "extract");
  mkdirSync2(extractDir, { recursive: true });
  const canonicalBinDir = resolve2(options.binDir);
  try {
    let unsafeArchiveEntry = false;
    await It({
      file: options.archivePath,
      onentry: (entry) => {
        if (options.signal.aborted || !isSafeArchiveEntry(entry.path, entry.type, canonicalBinDir)) {
          unsafeArchiveEntry = true;
        }
      }
    });
    if (unsafeArchiveEntry) {
      return null;
    }
    await co({
      file: options.archivePath,
      cwd: extractDir,
      filter: (path) => isSafeArchivePath(path, canonicalBinDir)
    });
    const candidate = join5(extractDir, options.binaryName);
    if (existsSync5(candidate)) {
      extractedPath = candidate;
    } else {
      extractedPath = join5(extractDir, "comment-checker");
    }
    return existsSync5(extractedPath) ? extractedPath : null;
  } catch {
    rmSync2(extractDir, { recursive: true, force: true });
    return null;
  }
}
function isSafeArchiveEntry(entryPath, type, canonicalBinDir) {
  if (type !== "File") {
    return false;
  }
  return isSafeArchivePath(entryPath, canonicalBinDir);
}
function isSafeArchivePath(entryPath, canonicalBinDir) {
  const normalized = normalize(entryPath);
  if (isAbsolute2(entryPath) || normalized.startsWith("..") || normalized.includes(`${sep}..${sep}`)) {
    return false;
  }
  const destination = resolve2(canonicalBinDir, normalized);
  const relativePath = relative2(canonicalBinDir, destination);
  return relativePath !== "" && !relativePath.startsWith("..") && !isAbsolute2(relativePath);
}
async function isExecutable2(path) {
  try {
    await access2(path, constants2.X_OK);
    return true;
  } catch {
    return false;
  }
}
function cleanOptionalUrl(value) {
  if (value === void 0) {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed === "" ? void 0 : trimmed;
}
function isOversizedResponse(response) {
  const contentLength = response.headers?.get("content-length");
  if (contentLength === void 0 || contentLength === null || contentLength.trim() === "") {
    return false;
  }
  const size = Number(contentLength);
  return Number.isFinite(size) && size > MAX_DOWNLOAD_BYTES;
}
function matchesExpectedSha256(buffer, expectedSha256) {
  if (expectedSha256 === void 0) {
    return true;
  }
  const normalized = expectedSha256.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    return false;
  }
  const actual = createHash("sha256").update(buffer).digest("hex");
  return actual === normalized;
}
async function writeFreshTempBinary(path, content) {
  const file = await open(path, "wx", 448);
  try {
    await file.writeFile(content);
  } finally {
    await file.close();
  }
}
async function isAbsentOrSafeRegularPath(path) {
  try {
    return isSafeStats(await lstat2(path));
  } catch (error) {
    return isNodeErrorWithCode(error, "ENOENT");
  }
}
async function isSafeRegularPath(path) {
  try {
    return isSafeStats(await lstat2(path));
  } catch {
    return false;
  }
}
async function isSafeExecutable(path) {
  return await isSafeRegularPath(path) && await isExecutable2(path);
}
function isSafeStats(stats) {
  return stats.isFile() && !stats.isSymbolicLink() && stats.nlink <= 1;
}
function isNodeErrorWithCode(error, code) {
  return error instanceof Error && "code" in error && error.code === code;
}

// dist/src/hooks/comment-checker/pending-store.js
import { createHash as createHash2 } from "node:crypto";
import { existsSync as existsSync6, mkdirSync as mkdirSync3, readdirSync as readdirSync2, readFileSync as readFileSync3, rmSync as rmSync3, unlinkSync, writeFileSync as writeFileSync3 } from "node:fs";
import { dirname as dirname3, join as join6 } from "node:path";
var COMMENT_CHECKER_PENDING_TTL_MS = 6e4;
function createPendingCommentStore(options) {
  return {
    put: (sessionId, pending) => {
      const path = pendingPath(options.pluginDataDir, sessionId, pending.key);
      if (path === void 0) {
        return false;
      }
      try {
        mkdirSync3(dirname3(path), { recursive: true });
        writeFileSync3(path, `${JSON.stringify(sanitizePendingCommentCheck(pending))}
`, "utf8");
        return true;
      } catch {
        return false;
      }
    },
    take: (sessionId, key, now) => {
      const path = pendingPath(options.pluginDataDir, sessionId, key);
      if (path === void 0 || !existsSync6(path)) {
        return void 0;
      }
      try {
        const pending = normalizePendingCommentCheck(JSON.parse(readFileSync3(path, "utf8")));
        unlinkSync(path);
        if (pending === void 0 || isExpired(pending, now)) {
          return void 0;
        }
        return pending;
      } catch {
        removePath2(path);
        return void 0;
      }
    },
    cleanupStale: (sessionId, now) => {
      const dir = sessionDir(options.pluginDataDir, sessionId);
      if (dir === void 0 || !existsSync6(dir)) {
        return;
      }
      for (const entry of readdirSync2(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith(".json")) {
          continue;
        }
        const path = join6(dir, entry.name);
        try {
          const pending = normalizePendingCommentCheck(JSON.parse(readFileSync3(path, "utf8")));
          if (pending === void 0 || isExpired(pending, now)) {
            unlinkSync(path);
          }
        } catch {
          removePath2(path);
        }
      }
      removeEmptyDir(dir);
    },
    deleteSession: (sessionId) => {
      const dir = sessionDir(options.pluginDataDir, sessionId);
      if (dir !== void 0) {
        removePath2(dir);
      }
    }
  };
}
function pendingPath(pluginDataDir, sessionId, key) {
  const dir = sessionDir(pluginDataDir, sessionId);
  return dir === void 0 ? void 0 : join6(dir, `${sha256(key)}.json`);
}
function sessionDir(pluginDataDir, sessionId) {
  if (pluginDataDir === void 0 || sessionId === void 0 || sessionId.trim() === "") {
    return void 0;
  }
  return join6(pluginDataDir, "comment-checker", "pending", encodeSessionId(sessionId));
}
function encodeSessionId(sessionId) {
  return `s-${Buffer.from(sessionId, "utf8").toString("base64url")}`;
}
function isExpired(pending, now) {
  return now - pending.createdAt > COMMENT_CHECKER_PENDING_TTL_MS;
}
function normalizePendingCommentCheck(value) {
  if (!isRecord4(value)) {
    return void 0;
  }
  if (typeof value.key !== "string" || !isPendingToolName(value.toolName) || typeof value.sessionId !== "string" || typeof value.filePath !== "string" || typeof value.createdAt !== "number") {
    return void 0;
  }
  return sanitizePendingCommentCheck({
    key: value.key,
    toolName: value.toolName,
    sessionId: value.sessionId,
    filePath: value.filePath,
    createdAt: value.createdAt
  });
}
function sanitizePendingCommentCheck(pending) {
  return {
    key: pending.key,
    toolName: pending.toolName,
    sessionId: pending.sessionId,
    filePath: pending.filePath,
    createdAt: pending.createdAt
  };
}
function isPendingToolName(value) {
  return value === "write" || value === "edit" || value === "multiedit";
}
function sha256(value) {
  return createHash2("sha256").update(value).digest("hex");
}
function removePath2(path) {
  try {
    rmSync3(path, { recursive: true, force: true });
  } catch {
  }
}
function removeEmptyDir(path) {
  try {
    if (existsSync6(path) && readdirSync2(path).length === 0) {
      rmSync3(path, { recursive: false, force: true });
    }
  } catch {
  }
}
function isRecord4(value) {
  return typeof value === "object" && value !== null;
}

// dist/src/hooks/comment-checker/runner.js
import { spawn as spawn2 } from "node:child_process";
var DEFAULT_TIMEOUT_MS = 6e3;
var DEFAULT_KILL_GRACE_MS = 1e3;
var MAX_STDERR_CHARS = 4096;
var DEFAULT_FINDING_MESSAGE = "Comment checker reported findings.";
function runCommentCheckerCommand(binaryPath, input, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const killGraceMs = options.killGraceMs ?? DEFAULT_KILL_GRACE_MS;
  return new Promise((resolve5) => {
    let settled = false;
    let terminating = false;
    let stderr = "";
    let termTimer;
    let killTimer;
    const child = spawn2(binaryPath, ["check"], {
      detached: process.platform !== "win32",
      env: buildCheckerEnv(options.env),
      stdio: ["pipe", "ignore", "pipe"],
      shell: false
    });
    child.unref();
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (chunk) => {
      stderr = appendCapped2(stderr, chunk, MAX_STDERR_CHARS);
    });
    child.stdin.on("error", () => {
    });
    child.on("error", () => {
      finish({ hasComments: false, message: "", unavailable: true });
    });
    child.on("close", (exitCode) => {
      if (terminating) {
        finish({ hasComments: false, message: "", unavailable: true });
        return;
      }
      if (exitCode === 0) {
        finish({ hasComments: false, message: "" });
        return;
      }
      if (exitCode === 2) {
        finish({ hasComments: true, message: normalizeFindingMessage(stderr) });
        return;
      }
      finish({ hasComments: false, message: "", unavailable: true });
    });
    options.signal?.addEventListener("abort", () => {
      terminateChild();
    }, { once: true });
    try {
      child.stdin.end(`${JSON.stringify(toCheckerHookInput(input))}
`);
    } catch {
      finish({ hasComments: false, message: "", unavailable: true });
    }
    termTimer = setTimeout(() => {
      terminateChild();
    }, timeoutMs);
    if (options.signal?.aborted === true) {
      terminateChild();
    }
    function terminateChild() {
      if (settled || terminating) {
        return;
      }
      terminating = true;
      if (termTimer !== void 0) {
        clearTimeout(termTimer);
        termTimer = void 0;
      }
      killChild(child.pid, "SIGTERM");
      killTimer = setTimeout(() => {
        killChild(child.pid, "SIGKILL");
      }, killGraceMs);
    }
    function finish(result) {
      if (settled) {
        return;
      }
      settled = true;
      if (termTimer !== void 0) {
        clearTimeout(termTimer);
      }
      if (!terminating && killTimer !== void 0) {
        clearTimeout(killTimer);
      }
      resolve5(result);
    }
  });
}
function toCheckerHookInput(input) {
  return {
    session_id: input.sessionId,
    tool_name: toClaudeToolName(input.toolName),
    transcript_path: "",
    cwd: input.cwd,
    hook_event_name: "PostToolUse",
    tool_input: {
      file_path: input.filePath,
      ...input.content === void 0 ? {} : { content: input.content },
      ...input.oldString === void 0 ? {} : { old_string: input.oldString },
      ...input.newString === void 0 ? {} : { new_string: input.newString },
      ...input.edits === void 0 ? {} : { edits: input.edits }
    }
  };
}
function toClaudeToolName(toolName) {
  const normalized = toolName.toLowerCase();
  if (normalized === "write") {
    return "Write";
  }
  if (normalized === "edit") {
    return "Edit";
  }
  if (normalized === "multiedit") {
    return "MultiEdit";
  }
  return toolName;
}
function appendCapped2(existing, chunk, maxChars) {
  if (existing.length >= maxChars) {
    return existing;
  }
  return `${existing}${chunk.slice(0, maxChars - existing.length)}`;
}
function normalizeFindingMessage(stderr) {
  const message = stderr.trim();
  return message === "" ? DEFAULT_FINDING_MESSAGE : message;
}
function buildCheckerEnv(env) {
  const minimalEnv = {};
  const path = env?.PATH ?? process.env.PATH;
  if (path !== void 0) {
    minimalEnv.PATH = path;
  }
  const systemRoot = env?.SystemRoot ?? process.env.SystemRoot;
  if (systemRoot !== void 0) {
    minimalEnv.SystemRoot = systemRoot;
  }
  return minimalEnv;
}
function killChild(pid, signal) {
  if (pid === void 0) {
    return;
  }
  try {
    if (process.platform !== "win32") {
      process.kill(-pid, signal);
      return;
    }
    process.kill(pid, signal);
  } catch {
  }
}

// dist/src/hooks/comment-checker/index.js
var HOOK_ID = "comment-checker";
var DEFAULT_BUDGET_MS = 7e3;
var DEFAULT_RUNNER_TIMEOUT_MS = 5500;
var DEFAULT_RUNNER_KILL_GRACE_MS = 750;
var DEFAULT_CLEANUP_WAIT_MS = 1e3;
var TRACKED_TOOLS = /* @__PURE__ */ new Set(["write", "edit", "multiedit"]);
function createCommentChecker(options = {}) {
  const now = options.now ?? Date.now;
  return async (envelope, context) => {
    const store = createPendingCommentStore({ pluginDataDir: context.pluginDataDir });
    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      store.deleteSession(envelope.sessionId);
      cleanupStaleCommentCheckerLocks({ pluginDataDir: context.pluginDataDir, now });
      return emptyResult();
    }
    if (envelope.eventName === "PreToolUse") {
      if (envelope.sessionId === void 0 || context.pluginDataDir === void 0 || envelope.toolInput === void 0 || !isTrackedTool(envelope.toolName)) {
        return emptyResult();
      }
      const pending2 = buildPendingCheck(envelope.toolName, envelope.sessionId, envelope.toolInput, envelope.raw, context.cwd, now());
      if (pending2 === void 0 || !isInsideCwd(context.cwd, pending2.filePath)) {
        return emptyResult();
      }
      store.cleanupStale(envelope.sessionId, now());
      return store.put(envelope.sessionId, pending2) ? emptyResult() : emptyResult();
    }
    if (envelope.eventName !== "PostToolUse" || envelope.sessionId === void 0 || context.pluginDataDir === void 0 || !isTrackedTool(envelope.toolName)) {
      return emptyResult();
    }
    if (!isSuccessfulToolResponse(envelope.toolResponse)) {
      return emptyResult();
    }
    const key = pendingKey(envelope.toolName, envelope.sessionId, envelope.toolInput, envelope.raw, context.cwd);
    if (key === void 0) {
      return emptyResult();
    }
    const pending = store.take(envelope.sessionId, key, now());
    if (pending === void 0) {
      return emptyResult();
    }
    const runInput = toRunInput(pending, context.cwd);
    if (runInput === null) {
      return emptyResult();
    }
    const budgetMs = options.budgetMs ?? DEFAULT_BUDGET_MS;
    const result = await withCommentCheckerBudget(budgetMs, async (signal) => {
      const runChecker = options.runChecker ?? createDefaultCheckerRunner(context, signal, budgetMs);
      return runChecker(runInput);
    });
    if (result === null || result.unavailable === true || !result.hasComments) {
      return emptyResult();
    }
    return { hookId: HOOK_ID, stopDecision: "block", message: result.message };
  };
}
function emptyResult() {
  return { hookId: HOOK_ID };
}
function createDefaultCheckerRunner(context, signal, budgetMs) {
  return async (input) => {
    const binary = await resolveCommentCheckerBinary({
      env: context.env,
      pluginDataDir: context.pluginDataDir,
      signal,
      now: context.now,
      download: (downloadSignal) => downloadCommentCheckerBinary({ pluginDataDir: context.pluginDataDir, signal: downloadSignal })
    });
    if (binary === null || signal.aborted) {
      return { hasComments: false, message: "", unavailable: true };
    }
    return runCommentCheckerCommand(binary.path, input, {
      env: context.env,
      killGraceMs: Math.min(DEFAULT_RUNNER_KILL_GRACE_MS, Math.max(25, Math.floor(budgetMs / 10))),
      signal,
      timeoutMs: Math.min(DEFAULT_RUNNER_TIMEOUT_MS, Math.max(25, budgetMs - Math.min(DEFAULT_RUNNER_KILL_GRACE_MS, Math.max(25, Math.floor(budgetMs / 10))) - 250))
    });
  };
}
async function withCommentCheckerBudget(budgetMs, run) {
  const controller = new AbortController();
  let timeout;
  let cleanupTimeout;
  const runPromise = run(controller.signal);
  try {
    const result = await Promise.race([
      runPromise,
      new Promise((resolve5) => {
        timeout = setTimeout(() => {
          controller.abort();
          resolve5(null);
        }, budgetMs);
      })
    ]);
    if (result !== null) {
      return result;
    }
    await Promise.race([
      runPromise.catch(() => void 0),
      new Promise((resolve5) => {
        cleanupTimeout = setTimeout(resolve5, Math.min(DEFAULT_CLEANUP_WAIT_MS, Math.max(25, budgetMs)));
      })
    ]);
    return null;
  } catch {
    return { hasComments: false, message: "", unavailable: true };
  } finally {
    if (timeout !== void 0) {
      clearTimeout(timeout);
    }
    if (cleanupTimeout !== void 0) {
      clearTimeout(cleanupTimeout);
    }
  }
}
function buildPendingCheck(toolName, sessionId, toolInput, raw, cwd, createdAt) {
  const normalizedToolName = normalizeToolName(toolName);
  if (normalizedToolName === void 0) {
    return void 0;
  }
  const inputPath = extractToolPath(toolInput);
  if (inputPath === void 0) {
    return void 0;
  }
  const filePath = canonicalizeExistingOrParent(resolveToolPath(cwd, inputPath));
  const key = pendingKey(toolName, sessionId, toolInput, raw, cwd);
  if (key === void 0) {
    return void 0;
  }
  return {
    key,
    toolName: normalizedToolName,
    sessionId,
    filePath,
    createdAt
  };
}
function pendingKey(toolName, sessionId, toolInput, raw, cwd) {
  const rawKey = readRawKey(raw);
  if (rawKey !== void 0) {
    return rawKey;
  }
  const normalizedToolName = normalizeToolName(toolName);
  if (normalizedToolName === void 0 || toolInput === void 0) {
    return void 0;
  }
  const inputPath = extractToolPath(toolInput);
  if (inputPath === void 0) {
    return void 0;
  }
  const filePath = canonicalizeExistingOrParent(resolveToolPath(cwd, inputPath));
  return sha2562(`${sessionId}\0${normalizedToolName}\0${filePath}\0${sha2562(JSON.stringify(pendingPayload(normalizedToolName, toolInput)))}`);
}
function pendingPayload(toolName, toolInput) {
  switch (toolName) {
    case "write":
      return { content: readString2(toolInput.content) };
    case "edit":
      return { oldString: readString2(toolInput.old_string) ?? readString2(toolInput.oldString), newString: readString2(toolInput.new_string) ?? readString2(toolInput.newString) };
    case "multiedit":
      return { edits: readEdits(toolInput.edits) };
  }
}
function toRunInput(pending, cwd) {
  const content = readFinalFileContent(pending.filePath);
  if (content === null) {
    return null;
  }
  return {
    sessionId: pending.sessionId,
    cwd,
    toolName: pending.toolName,
    filePath: pending.filePath,
    ...content === void 0 ? {} : { content }
  };
}
function readFinalFileContent(filePath) {
  try {
    if (!existsSync7(filePath)) {
      return void 0;
    }
    return readFileSync4(filePath, "utf8");
  } catch {
    return null;
  }
}
function readRawKey(raw) {
  return readString2(raw.tool_use_id) ?? readString2(raw.tool_call_id);
}
function isTrackedTool(toolName) {
  const normalized = normalizeToolName(toolName);
  return normalized !== void 0 && TRACKED_TOOLS.has(normalized);
}
function normalizeToolName(toolName) {
  const normalized = toolName?.toLowerCase();
  return normalized === "write" || normalized === "edit" || normalized === "multiedit" ? normalized : void 0;
}
function readString2(value) {
  return typeof value === "string" ? value : void 0;
}
function readEdits(value) {
  if (!Array.isArray(value)) {
    return void 0;
  }
  const edits = [];
  for (const item of value) {
    if (!isRecord5(item) || typeof item.old_string !== "string" || typeof item.new_string !== "string") {
      return void 0;
    }
    edits.push({ old_string: item.old_string, new_string: item.new_string });
  }
  return edits;
}
function isInsideCwd(cwd, filePath) {
  const canonicalCwd = canonicalizeExistingOrParent(cwd);
  return isPathInsideDirectory(canonicalCwd, filePath);
}
function sha2562(value) {
  return createHash3("sha256").update(value).digest("hex");
}
function isRecord5(value) {
  return typeof value === "object" && value !== null;
}

// dist/src/hooks/shared/context-block.js
function formatContextBlock(input) {
  return `[${input.heading}: ${input.path}]
${input.body}
`;
}
function truncateContent(content, limit, path) {
  if (content.length <= limit) {
    return { content, truncated: false };
  }
  return {
    content: `${content.slice(0, limit)}

[Note: Content was truncated to save context window space. For full context, please read the file directly: ${path}]`,
    truncated: true
  };
}

// dist/src/hooks/shared/directory-context.js
import { constants as constants3 } from "node:fs";
import { access as access3, readFile as readFile2 } from "node:fs/promises";
import { dirname as dirname4, join as join7, relative as relative3, resolve as resolve3 } from "node:path";
async function collectDirectoryContext(request) {
  const cwd = canonicalizeExistingOrParent(resolve3(request.cwd));
  const filePath = canonicalizeExistingOrParent(resolve3(cwd, request.filePath));
  if (!isPathInsideDirectory(cwd, filePath)) {
    return { context: "", injectedDirectories: [] };
  }
  const directories = collectDirectories(dirname4(filePath), cwd, request.includeRoot);
  const blocks = [];
  const injectedDirectories = [];
  for (const directory of directories) {
    if (request.alreadyInjectedDirectories.has(directory)) {
      continue;
    }
    const contextPath = join7(directory, request.filename);
    if (!await fileExists(contextPath)) {
      continue;
    }
    try {
      const content = await readFile2(contextPath, "utf8");
      const truncated = await request.truncator.truncate(request.sessionId, content);
      const relativePath = relative3(cwd, contextPath);
      blocks.push(formatContextBlock({ heading: request.heading, path: relativePath, body: truncated.result }));
      injectedDirectories.push(directory);
    } catch {
    }
  }
  return { context: blocks.join("\n"), injectedDirectories };
}
function collectDirectories(startDirectory, rootDirectory, includeRoot) {
  const directories = [];
  let current = resolve3(startDirectory);
  const root = resolve3(rootDirectory);
  while (true) {
    if (!isPathInsideDirectory(root, current)) {
      break;
    }
    if (includeRoot || current !== root) {
      directories.push(current);
    }
    if (current === root) {
      break;
    }
    const parent = dirname4(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return directories.reverse();
}
async function fileExists(path) {
  return access3(path, constants3.F_OK).then(() => true).catch(() => false);
}

// dist/src/hooks/shared/dynamic-truncator.js
function createDynamicTruncator(options) {
  const effectiveLimit = usesLargeContextWindow(options) ? 5 * options.maxContextChars : options.maxContextChars;
  return {
    truncate: async (_sessionID, content) => {
      if (content.length <= effectiveLimit) {
        return { result: content, truncated: false };
      }
      return { result: content.slice(0, effectiveLimit), truncated: true };
    }
  };
}
function usesLargeContextWindow(options) {
  return options.modelCacheState?.anthropicContext1MEnabled === true || (options.modelContextWindow ?? 0) >= 1e6;
}

// dist/src/hooks/shared/lifecycle-state.js
import { rmSync as rmSync5 } from "node:fs";
import { join as join9 } from "node:path";

// dist/src/hooks/shared/state-store.js
import { existsSync as existsSync8, mkdirSync as mkdirSync4, readFileSync as readFileSync5, renameSync, rmSync as rmSync4, writeFileSync as writeFileSync4 } from "node:fs";
import { randomUUID as randomUUID2 } from "node:crypto";
import { dirname as dirname5, join as join8 } from "node:path";
var LOCK_ATTEMPTS2 = 5;
var LOCK_RETRY_MS2 = 50;
var STALE_LOCK_MS = 3e4;
function createJsonStateStore(options) {
  return {
    load: () => {
      const paths = resolveStatePaths(options);
      return paths === void 0 ? void 0 : readJsonState(paths.statePath, options.version);
    },
    save: (state) => withStateLock(options, (paths) => writeJsonState(paths.statePath, options.version, state)),
    mutate: (mutator) => withStateLock(options, (paths) => {
      const current = readJsonState(paths.statePath, options.version);
      return writeJsonState(paths.statePath, options.version, mutator(current));
    })
  };
}
function readJsonState(statePath, version) {
  if (!existsSync8(statePath)) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(readFileSync5(statePath, "utf8"));
    if (!isStateEnvelope(parsed) || parsed.version !== version) {
      return void 0;
    }
    return parsed.payload;
  } catch {
    return void 0;
  }
}
function withStateLock(options, run) {
  const paths = resolveStatePaths(options);
  if (paths === void 0) {
    return false;
  }
  const lock = acquireLock2(paths.lockPath);
  if (lock === void 0) {
    return false;
  }
  try {
    return run(paths);
  } catch {
    return false;
  } finally {
    releaseLock2(lock);
  }
}
function resolveStatePaths(options) {
  if (options.pluginDataDir === void 0 || options.sessionId === void 0 || options.sessionId.trim() === "") {
    return void 0;
  }
  const hookDir = join8(options.pluginDataDir, options.hookId);
  const sessionKey = encodeSessionStateKey(options.sessionId);
  return {
    statePath: join8(hookDir, `${sessionKey}.json`),
    lockPath: join8(hookDir, ".locks", sessionKey)
  };
}
function encodeSessionStateKey(sessionId) {
  return `s-${Buffer.from(sessionId, "utf8").toString("base64url")}`;
}
function acquireLock2(lockPath) {
  try {
    mkdirSync4(dirname5(lockPath), { recursive: true });
  } catch {
    return void 0;
  }
  for (let attempt = 0; attempt < LOCK_ATTEMPTS2; attempt++) {
    try {
      const token = randomUUID2();
      mkdirSync4(lockPath);
      try {
        writeFileSync4(join8(lockPath, "owner.json"), `${JSON.stringify({ pid: process.pid, createdAt: Date.now(), token })}
`, "utf8");
      } catch (error) {
        rmSync4(lockPath, { recursive: true, force: true });
        throw error;
      }
      return { path: lockPath, token };
    } catch (error) {
      if (!isErrorWithCode2(error) || error.code !== "EEXIST") {
        return void 0;
      }
      if (isStaleLock2(lockPath)) {
        reapStaleLock(lockPath);
        continue;
      }
      sleep2(LOCK_RETRY_MS2);
    }
  }
  return void 0;
}
function releaseLock2(lock) {
  try {
    const owner = readLockOwner(lock.path);
    if (owner?.token === lock.token) {
      rmSync4(lock.path, { recursive: true, force: true });
    }
  } catch {
  }
}
function isStaleLock2(lockPath) {
  const owner = readLockOwner(lockPath);
  return owner !== void 0 && Date.now() - owner.createdAt > STALE_LOCK_MS;
}
function reapStaleLock(lockPath) {
  try {
    rmSync4(lockPath, { recursive: true, force: true });
  } catch {
  }
}
function readLockOwner(lockPath) {
  try {
    const parsed = JSON.parse(readFileSync5(join8(lockPath, "owner.json"), "utf8"));
    if (!isRecord6(parsed) || typeof parsed.createdAt !== "number" || typeof parsed.token !== "string") {
      return void 0;
    }
    return { createdAt: parsed.createdAt, token: parsed.token };
  } catch {
    return void 0;
  }
}
function writeJsonState(statePath, version, payload) {
  try {
    mkdirSync4(dirname5(statePath), { recursive: true });
    const tempPath = `${statePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
    writeFileSync4(tempPath, `${JSON.stringify({ version, payload })}
`, "utf8");
    renameSync(tempPath, statePath);
    return true;
  } catch {
    return false;
  }
}
function sleep2(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}
function isStateEnvelope(value) {
  return typeof value === "object" && value !== null && Object.hasOwn(value, "version") && Object.hasOwn(value, "payload");
}
function isRecord6(value) {
  return typeof value === "object" && value !== null;
}
function isErrorWithCode2(value) {
  return typeof value === "object" && value !== null && "code" in value && typeof value.code === "string";
}

// dist/src/hooks/shared/lifecycle-state.js
function deleteHookSessionState(reference) {
  if (reference.pluginDataDir === void 0 || reference.sessionId === void 0 || reference.sessionId.trim() === "") {
    return;
  }
  const sessionKey = encodeSessionStateKey(reference.sessionId);
  rmSync5(join9(reference.pluginDataDir, reference.hookId, sessionKey), { recursive: true, force: true });
  rmSync5(join9(reference.pluginDataDir, reference.hookId, `${sessionKey}.json`), { force: true });
}

// dist/src/hooks/directory-agents-injector/index.js
var HOOK_ID2 = "directory-agents-injector";
var STATE_VERSION = 1;
var FILENAME = "AGENTS.md";
var HEADING = "Directory Context";
var TRUNCATION_MARKER = "__HOOK_PACK_TRUNCATED_CONTEXT__";
function createDirectoryAgentsInjector() {
  return async (envelope, context) => {
    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      deleteHookSessionState({ pluginDataDir: context.pluginDataDir, hookId: HOOK_ID2, sessionId: envelope.sessionId });
      return emptyResult2();
    }
    if (envelope.eventName !== "PostToolUse" || !toolNameEquals(envelope.toolName, "Read")) {
      return emptyResult2();
    }
    if (envelope.sessionId === void 0 || context.pluginDataDir === void 0 || envelope.toolResponse === void 0 || envelope.toolResponse === null || !isSuccessfulToolResponse(envelope.toolResponse)) {
      return emptyResult2();
    }
    const filePath = extractReadPath(envelope.toolInput, envelope.toolResponse);
    if (filePath === void 0) {
      return emptyResult2();
    }
    const store = createJsonStateStore({
      pluginDataDir: context.pluginDataDir,
      hookId: HOOK_ID2,
      sessionId: envelope.sessionId,
      version: STATE_VERSION
    });
    const state = store.load();
    const alreadyInjectedDirectories = new Set(state?.injectedDirectories ?? []);
    const result = await collectDirectoryContext({
      cwd: context.cwd,
      filePath,
      filename: FILENAME,
      heading: HEADING,
      includeRoot: true,
      truncator: createMarkedTruncator(context.userConfig.maxContextChars),
      alreadyInjectedDirectories,
      sessionId: envelope.sessionId
    });
    if (result.context.length === 0 || result.injectedDirectories.length === 0) {
      return emptyResult2();
    }
    const nextInjectedDirectories = uniqueStrings([...alreadyInjectedDirectories, ...result.injectedDirectories]);
    if (!store.save({ injectedDirectories: nextInjectedDirectories })) {
      return emptyResult2();
    }
    return { hookId: HOOK_ID2, additionalContext: replaceTruncationMarkers(result.context) };
  };
}
function emptyResult2() {
  return { hookId: HOOK_ID2 };
}
function toolNameEquals(toolName, expected) {
  return toolName?.toLowerCase() === expected.toLowerCase();
}
function extractReadPath(toolInput, toolResponse) {
  const inputPath = extractToolPath(toolInput);
  if (inputPath !== void 0) {
    return inputPath;
  }
  if (!isRecord7(toolResponse) || !isRecord7(toolResponse.metadata)) {
    return void 0;
  }
  return readString3(toolResponse.metadata.filePath) ?? readString3(toolResponse.metadata.file_path);
}
function readString3(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? void 0 : value;
}
function isRecord7(value) {
  return typeof value === "object" && value !== null;
}
function createMarkedTruncator(maxContextChars) {
  const truncator = createDynamicTruncator({ maxContextChars });
  return {
    truncate: async (sessionId, content) => {
      const truncated = await truncator.truncate(sessionId, content);
      if (!truncated.truncated) {
        return truncated;
      }
      return { result: `${truncated.result}

${TRUNCATION_MARKER}`, truncated: true };
    }
  };
}
function replaceTruncationMarkers(context) {
  let currentPath = "";
  return context.split("\n").map((line) => {
    const path = parseContextPath(line);
    if (path !== void 0) {
      currentPath = path;
    }
    return line.replaceAll(TRUNCATION_MARKER, truncationNotice(currentPath));
  }).join("\n");
}
function parseContextPath(line) {
  const prefix = `[${HEADING}: `;
  if (!line.startsWith(prefix) || !line.endsWith("]")) {
    return void 0;
  }
  return line.slice(prefix.length, -1);
}
function truncationNotice(path) {
  return truncateContent("x", 0, path).content.trimStart();
}
function uniqueStrings(values) {
  return [...new Set(values)];
}

// dist/src/hooks/directory-readme-injector/index.js
var HOOK_ID3 = "directory-readme-injector";
var STATE_VERSION2 = 1;
var FILENAME2 = "README.md";
var HEADING2 = "Project README";
var TRUNCATION_MARKER2 = "__HOOK_PACK_TRUNCATED_CONTEXT__";
function createDirectoryReadmeInjector() {
  return async (envelope, context) => {
    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      deleteHookSessionState({ pluginDataDir: context.pluginDataDir, hookId: HOOK_ID3, sessionId: envelope.sessionId });
      return emptyResult3();
    }
    if (envelope.eventName !== "PostToolUse" || !toolNameEquals2(envelope.toolName, "Read")) {
      return emptyResult3();
    }
    if (envelope.sessionId === void 0 || context.pluginDataDir === void 0 || envelope.toolResponse === void 0 || envelope.toolResponse === null || !isSuccessfulToolResponse(envelope.toolResponse)) {
      return emptyResult3();
    }
    const filePath = extractReadPath2(envelope.toolInput, envelope.toolResponse);
    if (filePath === void 0) {
      return emptyResult3();
    }
    const store = createJsonStateStore({
      pluginDataDir: context.pluginDataDir,
      hookId: HOOK_ID3,
      sessionId: envelope.sessionId,
      version: STATE_VERSION2
    });
    const state = store.load();
    const alreadyInjectedDirectories = new Set(state?.injectedDirectories ?? []);
    const result = await collectDirectoryContext({
      cwd: context.cwd,
      filePath,
      filename: FILENAME2,
      heading: HEADING2,
      includeRoot: true,
      truncator: createMarkedTruncator2(context.userConfig.maxContextChars),
      alreadyInjectedDirectories,
      sessionId: envelope.sessionId
    });
    if (result.context.length === 0 || result.injectedDirectories.length === 0) {
      return emptyResult3();
    }
    const nextInjectedDirectories = uniqueStrings2([...alreadyInjectedDirectories, ...result.injectedDirectories]);
    if (!store.save({ injectedDirectories: nextInjectedDirectories })) {
      return emptyResult3();
    }
    return { hookId: HOOK_ID3, additionalContext: replaceTruncationMarkers2(result.context) };
  };
}
function emptyResult3() {
  return { hookId: HOOK_ID3 };
}
function toolNameEquals2(toolName, expected) {
  return toolName?.toLowerCase() === expected.toLowerCase();
}
function extractReadPath2(toolInput, toolResponse) {
  const inputPath = extractToolPath(toolInput);
  if (inputPath !== void 0) {
    return inputPath;
  }
  if (!isRecord8(toolResponse) || !isRecord8(toolResponse.metadata)) {
    return void 0;
  }
  return readString4(toolResponse.metadata.filePath) ?? readString4(toolResponse.metadata.file_path);
}
function readString4(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? void 0 : value;
}
function isRecord8(value) {
  return typeof value === "object" && value !== null;
}
function createMarkedTruncator2(maxContextChars) {
  const truncator = createDynamicTruncator({ maxContextChars });
  return {
    truncate: async (sessionId, content) => {
      const truncated = await truncator.truncate(sessionId, content);
      if (!truncated.truncated) {
        return truncated;
      }
      return { result: `${truncated.result}

${TRUNCATION_MARKER2}`, truncated: true };
    }
  };
}
function replaceTruncationMarkers2(context) {
  let currentPath = "";
  return context.split("\n").map((line) => {
    const path = parseContextPath2(line);
    if (path !== void 0) {
      currentPath = path;
    }
    return line.replaceAll(TRUNCATION_MARKER2, truncationNotice2(currentPath));
  }).join("\n");
}
function parseContextPath2(line) {
  const prefix = `[${HEADING2}: `;
  if (!line.startsWith(prefix) || !line.endsWith("]")) {
    return void 0;
  }
  return line.slice(prefix.length, -1);
}
function truncationNotice2(path) {
  return truncateContent("x", 0, path).content.trimStart();
}
function uniqueStrings2(values) {
  return [...new Set(values)];
}

// dist/src/hooks/rules-injector/index.js
import { rmSync as rmSync8 } from "node:fs";
import { homedir } from "node:os";
import { join as join12 } from "node:path";

// dist/src/hooks/shared/rule-discovery.js
import { existsSync as existsSync10, mkdirSync as mkdirSync6, readFileSync as readFileSync7, readdirSync as readdirSync3, realpathSync as realpathSync2, renameSync as renameSync2, rmSync as rmSync7, statSync, writeFileSync as writeFileSync6 } from "node:fs";
import { basename as basename3, dirname as dirname7, join as join10, relative as relative5, resolve as resolve4 } from "node:path";

// dist/src/hooks/shared/file-lock.js
import { existsSync as existsSync9, mkdirSync as mkdirSync5, readFileSync as readFileSync6, rmSync as rmSync6, writeFileSync as writeFileSync5 } from "node:fs";
import { randomUUID as randomUUID3 } from "node:crypto";
import { dirname as dirname6 } from "node:path";
var LOCK_ATTEMPTS3 = 5;
var LOCK_RETRY_MS3 = 50;
var STALE_LOCK_MS2 = 3e4;
function withFileLock(lockDir, run) {
  const lock = acquireLock3(lockDir);
  if (lock === void 0) {
    return false;
  }
  try {
    return run();
  } catch {
    return false;
  } finally {
    releaseLock3(lock);
  }
}
function acquireLock3(lockDir) {
  try {
    mkdirSync5(dirname6(lockDir), { recursive: true });
  } catch {
    return void 0;
  }
  for (let attempt = 0; attempt < LOCK_ATTEMPTS3; attempt++) {
    try {
      const token = randomUUID3();
      mkdirSync5(lockDir);
      try {
        writeFileSync5(`${lockDir}/owner.json`, `${JSON.stringify({ pid: process.pid, createdAt: Date.now(), token })}
`, "utf8");
      } catch (error) {
        rmSync6(lockDir, { recursive: true, force: true });
        throw error;
      }
      return { dir: lockDir, token };
    } catch (error) {
      if (!isErrorWithCode3(error) || error.code !== "EEXIST") {
        return void 0;
      }
      if (isStaleLock3(lockDir)) {
        reapStaleLock2(lockDir);
        continue;
      }
      sleep3(LOCK_RETRY_MS3);
    }
  }
  return void 0;
}
function releaseLock3(lock) {
  try {
    if (existsSync9(lock.dir) && readLockToken(lock.dir) === lock.token) {
      rmSync6(lock.dir, { recursive: true, force: true });
    }
  } catch {
  }
}
function isStaleLock3(lockDir) {
  const owner = readLockOwner2(lockDir);
  return owner !== void 0 && Date.now() - owner.createdAt > STALE_LOCK_MS2;
}
function reapStaleLock2(lockDir) {
  try {
    rmSync6(lockDir, { recursive: true, force: true });
  } catch {
  }
}
function readLockToken(lockDir) {
  return readLockOwner2(lockDir)?.token;
}
function readLockOwner2(lockDir) {
  try {
    const parsed = JSON.parse(readFileSync6(`${lockDir}/owner.json`, "utf8"));
    if (!isRecord9(parsed) || typeof parsed.createdAt !== "number" || typeof parsed.token !== "string") {
      return void 0;
    }
    return { createdAt: parsed.createdAt, token: parsed.token };
  } catch {
    return void 0;
  }
}
function sleep3(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}
function isErrorWithCode3(value) {
  return typeof value === "object" && value !== null && "code" in value && typeof value.code === "string";
}
function isRecord9(value) {
  return typeof value === "object" && value !== null;
}

// dist/src/hooks/shared/frontmatter.js
function parseRuleFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  if (!match) {
    return { metadata: {}, body: content };
  }
  const yamlContent = match[1] ?? "";
  const body = match[2] ?? "";
  try {
    const metadata = parseYamlContent(yamlContent);
    return { metadata, body };
  } catch {
    return { metadata: {}, body: content };
  }
}
function parseYamlContent(yamlContent) {
  const lines = yamlContent.split("\n");
  const metadata = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      i++;
      continue;
    }
    const key = line.slice(0, colonIndex).trim();
    const rawValue = line.slice(colonIndex + 1).trim();
    if (key === "description") {
      metadata.description = parseStringValue(rawValue);
    } else if (key === "alwaysApply") {
      metadata.alwaysApply = rawValue === "true";
    } else if (key === "globs" || key === "paths" || key === "applyTo") {
      const { value, consumed } = parseArrayOrStringValue(rawValue, lines, i);
      metadata.globs = mergeGlobs(metadata.globs, value);
      i += consumed;
      continue;
    }
    i++;
  }
  return metadata;
}
function parseStringValue(value) {
  if (!value)
    return "";
  if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
}
function parseArrayOrStringValue(rawValue, lines, currentIndex) {
  if (rawValue.startsWith("[")) {
    return { value: parseInlineArray(rawValue), consumed: 1 };
  }
  if (!rawValue || rawValue === "") {
    const arrayItems = [];
    let consumed = 1;
    for (let j2 = currentIndex + 1; j2 < lines.length; j2++) {
      const nextLine = lines[j2] ?? "";
      const arrayMatch = nextLine.match(/^\s+-\s*(.*)$/);
      if (arrayMatch) {
        const itemValue = parseStringValue((arrayMatch[1] ?? "").trim());
        if (itemValue) {
          arrayItems.push(itemValue);
        }
        consumed++;
      } else if (nextLine.trim() === "") {
        consumed++;
      } else {
        break;
      }
    }
    if (arrayItems.length > 0) {
      return { value: arrayItems, consumed };
    }
  }
  const stringValue = parseStringValue(rawValue);
  if (stringValue.includes(",")) {
    const items = stringValue.split(",").map((s3) => s3.trim()).filter((s3) => s3.length > 0);
    return { value: items, consumed: 1 };
  }
  return { value: stringValue, consumed: 1 };
}
function parseInlineArray(value) {
  const content = value.slice(1, value.lastIndexOf("]")).trim();
  if (!content)
    return [];
  const items = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";
  for (let i = 0; i < content.length; i++) {
    const char = content[i] ?? "";
    if (!inQuote && (char === '"' || char === "'")) {
      inQuote = true;
      quoteChar = char;
    } else if (inQuote && char === quoteChar) {
      inQuote = false;
      quoteChar = "";
    } else if (!inQuote && char === ",") {
      const trimmed2 = current.trim();
      if (trimmed2) {
        items.push(parseStringValue(trimmed2));
      }
      current = "";
    } else {
      current += char;
    }
  }
  const trimmed = current.trim();
  if (trimmed) {
    items.push(parseStringValue(trimmed));
  }
  return items;
}
function mergeGlobs(existing, newValue) {
  if (!existing)
    return newValue;
  const existingArray = Array.isArray(existing) ? existing : [existing];
  const newArray = Array.isArray(newValue) ? newValue : [newValue];
  return [...existingArray, ...newArray];
}

// dist/src/hooks/shared/rule-discovery-matcher.js
var import_picomatch = __toESM(require_picomatch2(), 1);
import { createHash as createHash4 } from "crypto";
import { relative as relative4 } from "node:path";
function shouldApplyRule(metadata, currentFilePath, projectRoot) {
  if (metadata.alwaysApply === true) {
    return { applies: true, reason: "alwaysApply" };
  }
  const globs = metadata.globs;
  if (!globs) {
    return { applies: false };
  }
  const patterns = Array.isArray(globs) ? globs : [globs];
  if (patterns.length === 0) {
    return { applies: false };
  }
  const relativePath = projectRoot ? relative4(projectRoot, currentFilePath) : currentFilePath;
  for (const pattern of patterns) {
    if (import_picomatch.default.isMatch(relativePath, pattern, { dot: true, bash: true })) {
      return { applies: true, reason: `glob: ${pattern}` };
    }
  }
  return { applies: false };
}
function isDuplicateByRealPath(realPath, cache) {
  return cache.has(realPath);
}
function createContentHash(content) {
  return createHash4("sha256").update(content).digest("hex").slice(0, 16);
}

// dist/src/hooks/shared/rule-discovery.js
var PROJECT_MARKERS = [".git", "pyproject.toml", "package.json", "Cargo.toml", "go.mod"];
var PROJECT_RULE_SUBDIRS = [
  [".github", "instructions"],
  [".cursor", "rules"],
  [".claude", "rules"]
];
var PROJECT_RULE_FILES = [".github/copilot-instructions.md"];
var USER_RULE_SUBDIRS = [
  [".github", "instructions"],
  [".cursor", "rules"],
  [".claude", "rules"]
];
var RULE_EXTENSIONS = [".md", ".mdc"];
var GITHUB_INSTRUCTIONS_PATTERN = /\.instructions\.md$/;
var EXCLUDED_DIRS = /* @__PURE__ */ new Set(["node_modules", ".git", "dist", "coverage", ".venv", "build", "target"]);
var USER_HOME_RULE_DISTANCE = 9999;
function findProjectRoot(startPath, cwdBoundary) {
  const boundary = canonicalizeExistingOrParent(cwdBoundary);
  const start = canonicalizeExistingOrParent(startPath);
  if (!isPathInsideDirectory(boundary, start)) {
    return void 0;
  }
  let current = getStartDirectory(start);
  while (isPathInsideDirectory(boundary, current)) {
    if (PROJECT_MARKERS.some((marker) => existsSync10(join10(current, marker)))) {
      return current;
    }
    if (current === boundary) {
      return boundary;
    }
    const parent = dirname7(current);
    if (parent === current) {
      return boundary;
    }
    current = parent;
  }
  return boundary;
}
function loadMatchingRules(options) {
  const projectRoot = canonicalizeExistingOrParent(options.projectRoot);
  const targetPath = resolve4(options.targetPath);
  const startDir = getStartDirectory(targetPath);
  const cacheKey = createScanCacheKey(projectRoot, startDir, options.homedir, options.includeUserRules);
  const candidates = loadCandidates(projectRoot, startDir, options.homedir, options.includeUserRules, options.scanCache, cacheKey);
  const matched = [];
  for (const candidate of candidates) {
    try {
      const parsed = readParsedRule(candidate, options.parsedRuleCache);
      const matchReason = candidate.isSingleFile ? "copilot-instructions (always apply)" : shouldApplyRule(parsed.metadata, targetPath, projectRoot).reason;
      if (matchReason === void 0) {
        continue;
      }
      matched.push({
        absolutePath: candidate.absolutePath,
        realpath: candidate.realpath,
        projectRelativePath: createDisplayPath(candidate.absolutePath, projectRoot, options.homedir),
        distance: candidate.distance,
        body: parsed.body,
        bodyHash: createContentHash(parsed.body),
        matchReason
      });
    } catch {
      continue;
    }
  }
  return matched.sort(compareRuleBlocks);
}
function findRuleFilesRecursive(dir, results) {
  if (!existsSync10(dir)) {
    return;
  }
  try {
    const entries = readdirSync3(dir, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const fullPath = join10(dir, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          findRuleFilesRecursive(fullPath, results);
        }
      } else if (entry.isFile() && isValidRuleFile(entry.name, dir)) {
        results.push(fullPath);
      }
    }
  } catch {
  }
}
function safeRealpathSync(filePath) {
  try {
    return realpathSync2(filePath);
  } catch {
    return filePath;
  }
}
function createFileBackedRuleScanCache(cachePath2) {
  return {
    get: (key) => readScanCache(cachePath2).entries?.[key],
    set: (key, value) => {
      const lockPath = join10(dirname7(cachePath2), ".locks", basename3(cachePath2));
      withFileLock(lockPath, () => {
        const current = readScanCache(cachePath2).entries ?? {};
        return writeScanCache(cachePath2, { entries: { ...current, [key]: [...value] } });
      });
    },
    clear: () => {
      try {
        rmSync7(cachePath2, { force: true });
      } catch {
      }
    }
  };
}
function loadCandidates(projectRoot, startDir, homeDir, includeUserRules, scanCache, cacheKey) {
  const cachedPaths = scanCache?.get(cacheKey);
  if (cachedPaths !== void 0) {
    return dedupeCandidates(cachedPaths.flatMap((filePath) => cachedCandidate(filePath, projectRoot, startDir, homeDir, includeUserRules)));
  }
  const candidates = discoverCandidates(projectRoot, startDir, homeDir, includeUserRules);
  scanCache?.set(cacheKey, candidates.map((candidate) => candidate.absolutePath));
  return candidates;
}
function discoverCandidates(projectRoot, startDir, homeDir, includeUserRules) {
  const candidates = [];
  const seenRealpaths = /* @__PURE__ */ new Set();
  let currentDir = startDir;
  let distance = 0;
  while (isPathInsideDirectory(projectRoot, currentDir)) {
    for (const [parent, subdir] of PROJECT_RULE_SUBDIRS) {
      collectRuleDir(join10(currentDir, parent, subdir), false, distance, candidates, seenRealpaths);
    }
    if (currentDir === projectRoot) {
      break;
    }
    const parentDir = dirname7(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
    distance += 1;
  }
  for (const ruleFile of PROJECT_RULE_FILES) {
    const absolutePath = join10(projectRoot, ruleFile);
    if (!isFile(absolutePath)) {
      continue;
    }
    pushCandidate({ absolutePath, isUserRule: false, distance: 0, isSingleFile: true }, candidates, seenRealpaths);
  }
  if (includeUserRules && homeDir !== void 0) {
    for (const [parent, subdir] of USER_RULE_SUBDIRS) {
      collectRuleDir(join10(homeDir, parent, subdir), true, USER_HOME_RULE_DISTANCE, candidates, seenRealpaths);
    }
  }
  return candidates.sort(compareCandidates);
}
function collectRuleDir(ruleDir, isUserRule, distance, candidates, seenRealpaths) {
  const files = [];
  findRuleFilesRecursive(ruleDir, files);
  for (const absolutePath of files) {
    pushCandidate({ absolutePath, isUserRule, distance, isSingleFile: false }, candidates, seenRealpaths);
  }
}
function pushCandidate(input, candidates, seenRealpaths) {
  const realpath = safeRealpathSync(input.absolutePath);
  if (isDuplicateByRealPath(realpath, seenRealpaths)) {
    return;
  }
  seenRealpaths.add(realpath);
  candidates.push({ ...input, realpath });
}
function cachedCandidate(absolutePath, projectRoot, startDir, homeDir, includeUserRules) {
  const normalizedPath = resolve4(absolutePath);
  for (const ruleFile of PROJECT_RULE_FILES) {
    if (normalizedPath === join10(projectRoot, ruleFile)) {
      return [{ absolutePath: normalizedPath, realpath: safeRealpathSync(normalizedPath), isUserRule: false, distance: 0, isSingleFile: true }];
    }
  }
  let currentDir = startDir;
  let distance = 0;
  while (isPathInsideDirectory(projectRoot, currentDir)) {
    for (const [parent, subdir] of PROJECT_RULE_SUBDIRS) {
      if (isPathInsideDirectory(join10(currentDir, parent, subdir), normalizedPath)) {
        return [{ absolutePath: normalizedPath, realpath: safeRealpathSync(normalizedPath), isUserRule: false, distance, isSingleFile: false }];
      }
    }
    if (currentDir === projectRoot) {
      break;
    }
    currentDir = dirname7(currentDir);
    distance += 1;
  }
  if (includeUserRules && homeDir !== void 0) {
    for (const [parent, subdir] of USER_RULE_SUBDIRS) {
      if (isPathInsideDirectory(join10(homeDir, parent, subdir), normalizedPath)) {
        return [{ absolutePath: normalizedPath, realpath: safeRealpathSync(normalizedPath), isUserRule: true, distance: USER_HOME_RULE_DISTANCE, isSingleFile: false }];
      }
    }
  }
  return [];
}
function dedupeCandidates(candidates) {
  const seenRealpaths = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const candidate of candidates) {
    if (!seenRealpaths.has(candidate.realpath)) {
      seenRealpaths.add(candidate.realpath);
      deduped.push(candidate);
    }
  }
  return deduped.sort(compareCandidates);
}
function readParsedRule(candidate, parsedRuleCache) {
  const stat = statSync(candidate.absolutePath);
  const cached = parsedRuleCache?.load(candidate.realpath, stat.mtimeMs, stat.size);
  if (cached !== void 0) {
    return { metadata: toRuleMetadata(cached.metadata), body: cached.body };
  }
  const parsed = parseRuleFrontmatter(readFileSync7(candidate.absolutePath, "utf8"));
  const metadata = toRuleMetadata(metadataToRecord(parsed.metadata));
  const normalized = { metadata, body: parsed.body };
  parsedRuleCache?.store(candidate.realpath, {
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    metadata: metadataToRecord(normalized.metadata),
    body: normalized.body
  });
  return normalized;
}
function isValidRuleFile(fileName, dir) {
  if (isGitHubInstructionsDir(dir)) {
    return GITHUB_INSTRUCTIONS_PATTERN.test(fileName);
  }
  return RULE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
}
function isGitHubInstructionsDir(dir) {
  const normalized = dir.replaceAll("\\", "/");
  return normalized.includes("/.github/instructions") || normalized.endsWith(".github/instructions");
}
function createDisplayPath(absolutePath, projectRoot, homeDir) {
  if (isPathInsideDirectory(projectRoot, absolutePath)) {
    return normalizePath(relative5(projectRoot, absolutePath));
  }
  if (homeDir !== void 0 && isPathInsideDirectory(homeDir, absolutePath)) {
    return `~/${normalizePath(relative5(homeDir, absolutePath))}`;
  }
  return normalizePath(absolutePath);
}
function compareCandidates(left, right) {
  if (left.isUserRule !== right.isUserRule) {
    return left.isUserRule ? 1 : -1;
  }
  const distance = left.distance - right.distance;
  return distance === 0 ? left.absolutePath.localeCompare(right.absolutePath) : distance;
}
function compareRuleBlocks(left, right) {
  const distance = left.distance - right.distance;
  return distance === 0 ? left.projectRelativePath.localeCompare(right.projectRelativePath) : distance;
}
function createScanCacheKey(projectRoot, startDir, homeDir, includeUserRules) {
  return `${projectRoot}|${startDir}|${homeDir ?? ""}|${includeUserRules ? "1" : "0"}`;
}
function getStartDirectory(startPath) {
  try {
    return statSync(startPath).isDirectory() ? startPath : dirname7(startPath);
  } catch {
    return dirname7(startPath);
  }
}
function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}
function toRuleMetadata(metadata) {
  const globs = metadata.globs;
  return {
    ...typeof metadata.description === "string" ? { description: metadata.description } : {},
    ...typeof metadata.alwaysApply === "boolean" ? { alwaysApply: metadata.alwaysApply } : {},
    ...typeof globs === "string" || isStringArray(globs) ? { globs } : {}
  };
}
function metadataToRecord(metadata) {
  const record = {};
  if (metadata.description !== void 0) {
    record.description = metadata.description;
  }
  if (metadata.globs !== void 0) {
    record.globs = metadata.globs;
  }
  if (metadata.alwaysApply !== void 0) {
    record.alwaysApply = metadata.alwaysApply;
  }
  return record;
}
function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function readScanCache(cachePath2) {
  try {
    const parsed = JSON.parse(readFileSync7(cachePath2, "utf8"));
    if (!isRecord10(parsed) || !Object.hasOwn(parsed, "entries")) {
      return {};
    }
    const entries = parsed.entries;
    if (entries !== void 0 && !isScanCacheEntries(entries)) {
      return {};
    }
    return entries === void 0 ? {} : { entries };
  } catch {
    return {};
  }
}
function writeScanCache(cachePath2, envelope) {
  try {
    mkdirSync6(dirname7(cachePath2), { recursive: true });
    const tempPath = join10(dirname7(cachePath2), `${basename3(cachePath2)}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`);
    writeFileSync6(tempPath, `${JSON.stringify(envelope)}
`, "utf8");
    renameSync2(tempPath, cachePath2);
    return true;
  } catch {
    return false;
  }
}
function normalizePath(path) {
  return path.replaceAll("\\", "/");
}
function isRecord10(value) {
  return typeof value === "object" && value !== null;
}
function isScanCacheEntries(value) {
  return isRecord10(value) && Object.values(value).every((entry) => Array.isArray(entry) && entry.every((item) => typeof item === "string"));
}

// dist/src/hooks/rules-injector/parsed-rule-cache.js
import { createHash as createHash5 } from "node:crypto";
import { mkdirSync as mkdirSync7, readFileSync as readFileSync8, renameSync as renameSync3, writeFileSync as writeFileSync7 } from "node:fs";
import { basename as basename4, dirname as dirname8, join as join11 } from "node:path";
function createParsedRuleCache(options) {
  return {
    load: (realpath, mtimeMs, size) => {
      if (options.pluginDataDir === void 0) {
        return void 0;
      }
      try {
        const parsed = JSON.parse(readFileSync8(cachePath(options.pluginDataDir, realpath), "utf8"));
        if (!isParsedRuleCacheEntry(parsed) || parsed.mtimeMs !== mtimeMs || parsed.size !== size) {
          return void 0;
        }
        return parsed;
      } catch {
        return void 0;
      }
    },
    store: (realpath, entry) => {
      if (options.pluginDataDir === void 0) {
        return false;
      }
      const targetPath = cachePath(options.pluginDataDir, realpath);
      const lockPath = join11(dirname8(targetPath), ".locks", basename4(targetPath));
      return withFileLock(lockPath, () => {
        mkdirSync7(dirname8(targetPath), { recursive: true });
        const tempPath = join11(dirname8(targetPath), `${basename4(targetPath)}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`);
        writeFileSync7(tempPath, `${JSON.stringify(entry)}
`, "utf8");
        renameSync3(tempPath, targetPath);
        return true;
      });
    }
  };
}
function cachePath(pluginDataDir, realpath) {
  return join11(pluginDataDir, "rules-injector", "parsed-cache", `${createHash5("sha256").update(realpath).digest("hex")}.json`);
}
function isParsedRuleCacheEntry(value) {
  return typeof value === "object" && value !== null && typeof value.mtimeMs === "number" && typeof value.size === "number" && typeof value.body === "string" && typeof value.metadata === "object" && value.metadata !== null;
}

// dist/src/hooks/rules-injector/index.js
var HOOK_ID4 = "rules-injector";
var STATE_VERSION3 = 1;
var TRACKED_TOOLS2 = /* @__PURE__ */ new Set(["read", "write", "edit", "multiedit"]);
function createRulesInjector() {
  return async (envelope, context) => {
    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      deleteSessionState(context.pluginDataDir, envelope.sessionId);
      return emptyResult4();
    }
    if (envelope.eventName !== "PostToolUse" || !isTrackedTool2(envelope.toolName)) {
      return emptyResult4();
    }
    if (envelope.sessionId === void 0 || context.pluginDataDir === void 0 || !isSuccessfulToolResponse(envelope.toolResponse)) {
      return emptyResult4();
    }
    const targetPath = getRuleInjectionFilePath(envelope.toolInput, envelope.toolResponse, context.cwd);
    if (targetPath === void 0) {
      return emptyResult4();
    }
    const canonicalCwd = canonicalizeExistingOrParent(context.cwd);
    const canonicalTargetPath = canonicalizeExistingOrParent(targetPath);
    if (!isPathInsideDirectory(canonicalCwd, canonicalTargetPath)) {
      return emptyResult4();
    }
    const projectRoot = findProjectRoot(canonicalTargetPath, canonicalCwd);
    if (projectRoot === void 0) {
      return emptyResult4();
    }
    const store = createJsonStateStore({
      pluginDataDir: context.pluginDataDir,
      hookId: `${HOOK_ID4}/sessions`,
      sessionId: envelope.sessionId,
      version: STATE_VERSION3
    });
    const scanCache = createFileBackedRuleScanCache(scanCachePath(context.pluginDataDir, envelope.sessionId));
    const parsedRuleCache = createParsedRuleCache({ pluginDataDir: context.pluginDataDir });
    const rules = loadMatchingRules({
      projectRoot,
      targetPath: canonicalTargetPath,
      homedir: context.env.HOME ?? homedir(),
      includeUserRules: context.userConfig.includeUserRules,
      scanCache,
      parsedRuleCache
    });
    let nextRules = [];
    const saved = store.mutate((current) => {
      const state = normalizeRulesInjectorState(current);
      const injectedRealpaths = new Set(state.injectedRealpaths);
      const injectedContentHashes = new Set(state.injectedContentHashes);
      nextRules = selectRulesNotInjected(rules, injectedRealpaths, injectedContentHashes);
      return { injectedRealpaths: [...injectedRealpaths], injectedContentHashes: [...injectedContentHashes] };
    });
    if (!saved || nextRules.length === 0) {
      return emptyResult4();
    }
    return {
      hookId: HOOK_ID4,
      additionalContext: await formatRules(nextRules, envelope.sessionId, context.userConfig.maxContextChars)
    };
  };
}
function getRuleInjectionFilePath(toolInput, toolResponse, cwd) {
  return extractPostToolPath(toolInput, toolResponse, cwd);
}
function emptyResult4() {
  return { hookId: HOOK_ID4 };
}
function isTrackedTool2(toolName) {
  return toolName !== void 0 && TRACKED_TOOLS2.has(toolName.toLowerCase());
}
function selectRulesNotInjected(rules, injectedRealpaths, injectedContentHashes) {
  const nextRules = [];
  for (const rule of rules) {
    if (injectedRealpaths.has(rule.realpath) || injectedContentHashes.has(rule.bodyHash)) {
      continue;
    }
    nextRules.push(rule);
    injectedRealpaths.add(rule.realpath);
    injectedContentHashes.add(rule.bodyHash);
  }
  return nextRules;
}
function normalizeRulesInjectorState(current) {
  if (current !== void 0 && Array.isArray(current.injectedRealpaths) && current.injectedRealpaths.every((item) => typeof item === "string") && Array.isArray(current.injectedContentHashes) && current.injectedContentHashes.every((item) => typeof item === "string")) {
    return current;
  }
  return { injectedRealpaths: [], injectedContentHashes: [] };
}
async function formatRules(rules, sessionId, maxContextChars) {
  const truncator = createDynamicTruncator({ maxContextChars });
  const formatted = [];
  for (const rule of rules) {
    const truncated = await truncator.truncate(sessionId, rule.body);
    const notice = truncated.truncated ? `

[Note: Content was truncated to save context window space. For full context, please read the file directly: ${rule.projectRelativePath}]` : "";
    formatted.push(`[Rule: ${rule.projectRelativePath}]
[Match: ${rule.matchReason}]
${truncated.result}${notice}`);
  }
  return formatted.join("\n\n");
}
function deleteSessionState(pluginDataDir, sessionId) {
  try {
    deleteHookSessionState({ pluginDataDir, hookId: `${HOOK_ID4}/sessions`, sessionId });
  } catch (error) {
    ignoreBestEffortCleanupError(error);
  }
  if (pluginDataDir === void 0 || sessionId === void 0 || sessionId.trim() === "") {
    return;
  }
  try {
    rmSync8(scanCachePath(pluginDataDir, sessionId), { force: true });
  } catch (error) {
    ignoreBestEffortCleanupError(error);
  }
}
function ignoreBestEffortCleanupError(error) {
  void error;
}
function scanCachePath(pluginDataDir, sessionId) {
  return join12(pluginDataDir, HOOK_ID4, "scan-cache", `${encodeURIComponent(sessionId)}.json`);
}

// dist/src/hooks/write-existing-file-guard/index.js
import { existsSync as existsSync11, realpathSync as realpathSync3, statSync as statSync3 } from "node:fs";

// dist/src/hooks/write-existing-file-guard/token-store.js
import { createHash as createHash6, randomUUID as randomUUID4 } from "node:crypto";
import { mkdirSync as mkdirSync8, readdirSync as readdirSync4, readFileSync as readFileSync9, rmSync as rmSync9, statSync as statSync2, unlinkSync as unlinkSync2, utimesSync, writeFileSync as writeFileSync8 } from "node:fs";
import { dirname as dirname9, join as join13 } from "node:path";
var DEFAULT_MAX_TRACKED_SESSIONS = 256;
var DEFAULT_MAX_TRACKED_PATHS_PER_SESSION = 1024;
var DEFAULT_STALE_LOCK_MS2 = 3e4;
var TOUCH_FILE = ".touch";
function createReadPermissionTokenStore(options) {
  const rootDir = options.pluginDataDir === void 0 ? void 0 : join13(options.pluginDataDir, options.hookId);
  const maxTrackedSessions = options.maxTrackedSessions ?? DEFAULT_MAX_TRACKED_SESSIONS;
  const maxTrackedPathsPerSession = options.maxTrackedPathsPerSession ?? DEFAULT_MAX_TRACKED_PATHS_PER_SESSION;
  const staleLockMs = options.staleLockMs ?? DEFAULT_STALE_LOCK_MS2;
  return {
    grantReadToken(sessionId, canonicalPath, fingerprint) {
      if (rootDir === void 0) {
        return false;
      }
      try {
        const now = options.now();
        const pathDir = pathTokenDir(rootDir, sessionId, canonicalPath);
        mkdirSync8(pathDir, { recursive: true });
        writeJson(join13(pathDir, `${now}-${randomUUID4()}.json`), {
          createdAt: now,
          touchedAt: now,
          fingerprint: toStoredFingerprint(fingerprint)
        });
        touchPath(pathDir, now);
        touchSession(rootDir, sessionId, now);
        trimSessionPathDirs(rootDir, sessionId, maxTrackedPathsPerSession);
        trimSessions(rootDir, maxTrackedSessions);
        return true;
      } catch {
        return false;
      }
    },
    consumeTokenAndInvalidateOtherSessions(sessionId, canonicalPath, currentFingerprint) {
      if (rootDir === void 0) {
        return "missing";
      }
      const lock = acquirePathLock(rootDir, canonicalPath, options.now, staleLockMs);
      if (lock === void 0) {
        return "locked";
      }
      try {
        const tokenFile = oldestTokenFile(pathTokenDir(rootDir, sessionId, canonicalPath));
        if (tokenFile === void 0) {
          return "missing";
        }
        const token = readStoredReadToken(tokenFile);
        if (token === void 0 || !fingerprintsMatch(token.fingerprint, currentFingerprint)) {
          unlinkIfExists(tokenFile);
          return "stale";
        }
        unlinkSync2(tokenFile);
        touchSession(rootDir, sessionId, options.now());
        trimSessions(rootDir, maxTrackedSessions);
        removeOtherSessionPathDirs(rootDir, canonicalPath, sessionId);
        return "consumed";
      } catch {
        return "locked";
      } finally {
        releasePathLock(lock);
      }
    },
    invalidateForOverwrite(canonicalPath, exceptSessionId) {
      if (rootDir === void 0) {
        return "invalidated";
      }
      const lock = acquirePathLock(rootDir, canonicalPath, options.now, staleLockMs);
      if (lock === void 0) {
        return "locked";
      }
      try {
        removeOtherSessionPathDirs(rootDir, canonicalPath, exceptSessionId);
        return "invalidated";
      } catch {
        return "locked";
      } finally {
        releasePathLock(lock);
      }
    },
    deleteSession(sessionId) {
      if (rootDir === void 0 || sessionId === void 0 || sessionId.trim() === "") {
        return;
      }
      rmSync9(sessionDir2(rootDir, sessionId), { recursive: true, force: true });
    }
  };
}
function acquirePathLock(rootDir, canonicalPath, now, staleLockMs) {
  const lockDir = join13(rootDir, ".locks", pathHash(canonicalPath));
  mkdirSync8(dirname9(lockDir), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const ownerToken = randomUUID4();
      mkdirSync8(lockDir, { recursive: false });
      try {
        writeJson(join13(lockDir, "owner.json"), { pid: process.pid, createdAt: now(), token: ownerToken });
      } catch (error) {
        rmSync9(lockDir, { recursive: true, force: true });
        throw error;
      }
      return { lockDir, ownerToken };
    } catch (error) {
      if (!isFileSystemError(error, "EEXIST")) {
        return void 0;
      }
      if (attempt === 0 && isStaleLock4(lockDir, now(), staleLockMs)) {
        reapStaleLock3(lockDir, rootDir, canonicalPath);
        continue;
      }
      return void 0;
    }
  }
  return void 0;
}
function reapStaleLock3(lockDir, rootDir, canonicalPath) {
  const reaperDir = join13(rootDir, ".locks", `.reap-${pathHash(canonicalPath)}`);
  try {
    mkdirSync8(reaperDir, { recursive: false });
  } catch {
    return;
  }
  try {
    rmSync9(lockDir, { recursive: true, force: true });
  } finally {
    rmSync9(reaperDir, { recursive: true, force: true });
  }
}
function releasePathLock(lock) {
  const owner = readJson(join13(lock.lockDir, "owner.json"));
  if (!isRecord11(owner) || owner.token !== lock.ownerToken) {
    return;
  }
  rmSync9(lock.lockDir, { recursive: true, force: true });
}
function isStaleLock4(lockDir, now, staleLockMs) {
  const owner = readJson(join13(lockDir, "owner.json"));
  if (isRecord11(owner) && typeof owner.createdAt === "number") {
    return now - owner.createdAt > staleLockMs;
  }
  return now - directoryMtime(lockDir, now) > staleLockMs;
}
function directoryMtime(directory, fallback) {
  try {
    return statSync2(directory).mtimeMs;
  } catch {
    return fallback;
  }
}
function trimSessions(rootDir, maxTrackedSessions) {
  const sessions = sessionDirectoryNames(rootDir).map((name) => ({ name, touchedAt: touchMtime(join13(rootDir, name, TOUCH_FILE)) }));
  sessions.sort(compareTouchedEntries);
  for (const session of sessions.slice(0, Math.max(0, sessions.length - maxTrackedSessions))) {
    rmSync9(join13(rootDir, session.name), { recursive: true, force: true });
  }
}
function trimSessionPathDirs(rootDir, sessionId, maxTrackedPathsPerSession) {
  const dir = sessionDir2(rootDir, sessionId);
  const paths = readdirDirents(dir).filter((entry) => entry.isDirectory()).map((entry) => ({ name: entry.name, touchedAt: touchMtime(join13(dir, entry.name, TOUCH_FILE)) }));
  paths.sort(compareTouchedEntries);
  for (const path of paths.slice(0, Math.max(0, paths.length - maxTrackedPathsPerSession))) {
    rmSync9(join13(dir, path.name), { recursive: true, force: true });
  }
}
function removeOtherSessionPathDirs(rootDir, canonicalPath, exceptSessionId) {
  const hash = pathHash(canonicalPath);
  const exceptSessionDirName = exceptSessionId === void 0 ? void 0 : sessionDirName(exceptSessionId);
  for (const sessionName of sessionDirectoryNames(rootDir)) {
    if (exceptSessionDirName !== void 0 && sessionName === exceptSessionDirName) {
      continue;
    }
    rmSync9(join13(rootDir, sessionName, hash), { recursive: true, force: true });
  }
}
function oldestTokenFile(pathDir) {
  const files = readdirDirents(pathDir).filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => {
    const filePath = join13(pathDir, entry.name);
    return { filePath, createdAt: readStoredReadToken(filePath)?.createdAt ?? touchMtime(filePath) };
  });
  files.sort((left, right) => left.createdAt - right.createdAt || left.filePath.localeCompare(right.filePath));
  return files[0]?.filePath;
}
function readStoredReadToken(filePath) {
  const parsed = readJson(filePath);
  if (!isRecord11(parsed) || typeof parsed.createdAt !== "number" || typeof parsed.touchedAt !== "number" || !isStoredFileFingerprint(parsed.fingerprint)) {
    return void 0;
  }
  return { createdAt: parsed.createdAt, touchedAt: parsed.touchedAt, fingerprint: parsed.fingerprint };
}
function isStoredFileFingerprint(value) {
  return isRecord11(value) && typeof value.realpathHash === "string" && typeof value.mtimeMs === "number" && typeof value.size === "number" && optionalNumber(value.dev) && optionalNumber(value.ino);
}
function fingerprintsMatch(left, right) {
  return left.realpathHash === pathHash(right.realpath) && left.mtimeMs === right.mtimeMs && left.size === right.size && optionalStatFieldMatches(left.dev, right.dev) && optionalStatFieldMatches(left.ino, right.ino);
}
function optionalNumber(value) {
  return value === void 0 || typeof value === "number";
}
function optionalStatFieldMatches(left, right) {
  return left === void 0 || right === void 0 || left === right;
}
function toStoredFingerprint(fingerprint) {
  return {
    realpathHash: pathHash(fingerprint.realpath),
    mtimeMs: fingerprint.mtimeMs,
    size: fingerprint.size,
    dev: fingerprint.dev,
    ino: fingerprint.ino
  };
}
function touchSession(rootDir, sessionId, now) {
  const dir = sessionDir2(rootDir, sessionId);
  mkdirSync8(dir, { recursive: true });
  touchFile(join13(dir, TOUCH_FILE), now);
}
function touchPath(pathDir, now) {
  touchFile(join13(pathDir, TOUCH_FILE), now);
}
function touchFile(filePath, millis) {
  writeFileSync8(filePath, String(millis), "utf8");
  const date = new Date(millis);
  utimesSync(filePath, date, date);
}
function touchMtime(filePath) {
  try {
    const storedTouchTime = Number(readFileSync9(filePath, "utf8"));
    if (Number.isFinite(storedTouchTime)) {
      return storedTouchTime;
    }
    return statSync2(filePath).mtimeMs;
  } catch {
    return 0;
  }
}
function compareTouchedEntries(left, right) {
  return left.touchedAt - right.touchedAt || left.name.localeCompare(right.name);
}
function sessionDirectoryNames(rootDir) {
  return readdirDirents(rootDir).filter((entry) => entry.isDirectory() && entry.name !== ".locks" && !entry.name.startsWith(".reap-")).map((entry) => entry.name);
}
function pathTokenDir(rootDir, sessionId, canonicalPath) {
  return join13(sessionDir2(rootDir, sessionId), pathHash(canonicalPath));
}
function sessionDir2(rootDir, sessionId) {
  return join13(rootDir, sessionDirName(sessionId));
}
function sessionDirName(sessionId) {
  return pathHash(sessionId);
}
function pathHash(canonicalPath) {
  return createHash6("sha256").update(canonicalPath).digest("hex");
}
function writeJson(filePath, value) {
  mkdirSync8(dirname9(filePath), { recursive: true });
  writeFileSync8(filePath, JSON.stringify(value), "utf8");
}
function readJson(filePath) {
  try {
    return JSON.parse(readFileSync9(filePath, "utf8"));
  } catch {
    return void 0;
  }
}
function unlinkIfExists(filePath) {
  try {
    unlinkSync2(filePath);
  } catch (error) {
    if (!isFileSystemError(error, "ENOENT")) {
      throw error;
    }
  }
}
function readdirDirents(path) {
  try {
    return readdirSync4(path, { withFileTypes: true });
  } catch (error) {
    if (isFileSystemError(error, "ENOENT")) {
      return [];
    }
    throw error;
  }
}
function isRecord11(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isFileSystemError(error, code) {
  return error instanceof Error && "code" in error && error.code === code;
}

// dist/src/hooks/write-existing-file-guard/index.js
var HOOK_ID5 = "write-existing-file-guard";
var MAX_TRACKED_SESSIONS = 256;
var MAX_TRACKED_PATHS_PER_SESSION = 1024;
var BLOCK_MESSAGE = "File already exists. Use edit tool instead.";
function createWriteExistingFileGuard() {
  return (envelope, context) => {
    const tokenStore = createReadPermissionTokenStore({
      pluginDataDir: context.pluginDataDir,
      hookId: HOOK_ID5,
      now: context.now,
      maxTrackedSessions: MAX_TRACKED_SESSIONS,
      maxTrackedPathsPerSession: MAX_TRACKED_PATHS_PER_SESSION
    });
    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      tokenStore.deleteSession(envelope.sessionId);
      return emptyResult5();
    }
    if (envelope.eventName === "PostToolUse" && toolNameEquals3(envelope.toolName, "Read")) {
      if (envelope.sessionId === void 0 || context.pluginDataDir === void 0 || !isSuccessfulToolResponse(envelope.toolResponse)) {
        return emptyResult5();
      }
      const canonicalPath2 = canonicalToolPathInsideCwd(envelope.toolInput, context.cwd);
      if (canonicalPath2 === void 0 || !existsSync11(canonicalPath2)) {
        return emptyResult5();
      }
      const fingerprint2 = fileFingerprint(canonicalPath2);
      if (fingerprint2 === void 0) {
        return emptyResult5();
      }
      tokenStore.grantReadToken(envelope.sessionId, canonicalPath2, fingerprint2);
      return emptyResult5();
    }
    if (envelope.eventName !== "PreToolUse" || !toolNameEquals3(envelope.toolName, "Write")) {
      return emptyResult5();
    }
    const inputPath = extractToolPath(envelope.toolInput);
    if (inputPath === void 0 || envelope.toolInput === void 0) {
      return emptyResult5();
    }
    const canonicalPath = canonicalizeExistingOrParent(resolveToolPath(context.cwd, inputPath));
    const canonicalCwd = canonicalizeExistingOrParent(context.cwd);
    const canonicalPluginDataDir = context.pluginDataDir === void 0 ? void 0 : canonicalizeExistingOrParent(context.pluginDataDir);
    if (canonicalPluginDataDir !== void 0 && isPathInsideDirectory(canonicalPluginDataDir, canonicalPath)) {
      return { hookId: HOOK_ID5, permissionDecision: "allow" };
    }
    if (!isPathInsideDirectory(canonicalCwd, canonicalPath)) {
      return emptyResult5();
    }
    if (!existsSync11(canonicalPath)) {
      return emptyResult5();
    }
    if (isOverwriteEnabled(readOverwrite(envelope.toolInput))) {
      const invalidation = tokenStore.invalidateForOverwrite(canonicalPath, envelope.sessionId);
      if (invalidation === "locked") {
        return denyResult();
      }
      return {
        hookId: HOOK_ID5,
        permissionDecision: "allow",
        updatedInput: cloneWithoutOverwrite(envelope.toolInput)
      };
    }
    if (context.pluginDataDir === void 0 || envelope.sessionId === void 0) {
      return denyResult();
    }
    const fingerprint = fileFingerprint(canonicalPath);
    if (fingerprint === void 0) {
      return denyResult();
    }
    const consumeResult = tokenStore.consumeTokenAndInvalidateOtherSessions(envelope.sessionId, canonicalPath, fingerprint);
    if (consumeResult === "consumed") {
      return { hookId: HOOK_ID5, permissionDecision: "allow" };
    }
    return denyResult();
  };
}
function canonicalToolPathInsideCwd(toolInput, cwd) {
  const inputPath = extractToolPath(toolInput);
  if (inputPath === void 0) {
    return void 0;
  }
  const canonicalPath = canonicalizeExistingOrParent(resolveToolPath(cwd, inputPath));
  const canonicalCwd = canonicalizeExistingOrParent(cwd);
  return isPathInsideDirectory(canonicalCwd, canonicalPath) ? canonicalPath : void 0;
}
function fileFingerprint(canonicalPath) {
  try {
    const realpath = realpathSync3(canonicalPath);
    const stats = statSync3(realpath);
    return { realpath, mtimeMs: stats.mtimeMs, size: stats.size, dev: stats.dev, ino: stats.ino };
  } catch {
    return void 0;
  }
}
function emptyResult5() {
  return { hookId: HOOK_ID5 };
}
function denyResult() {
  return { hookId: HOOK_ID5, permissionDecision: "deny", message: BLOCK_MESSAGE };
}
function toolNameEquals3(toolName, expected) {
  return toolName?.toLowerCase() === expected.toLowerCase();
}
function readOverwrite(toolInput) {
  const value = toolInput.overwrite;
  return typeof value === "boolean" || typeof value === "string" ? value : void 0;
}
function isOverwriteEnabled(value) {
  if (value === true) {
    return true;
  }
  return typeof value === "string" && value.toLowerCase() === "true";
}
function cloneWithoutOverwrite(toolInput) {
  const updatedInput = { ...toolInput };
  delete updatedInput.overwrite;
  return updatedInput;
}

// dist/src/hooks/index.js
var BUILT_IN_HOOK_HANDLERS = {
  "comment-checker": createCommentChecker(),
  "directory-agents-injector": createDirectoryAgentsInjector(),
  "directory-readme-injector": createDirectoryReadmeInjector(),
  "rules-injector": createRulesInjector(),
  "write-existing-file-guard": createWriteExistingFileGuard()
};
function getBuiltInHookHandler(handlerId) {
  return BUILT_IN_HOOK_HANDLERS[handlerId];
}

// dist/src/cli/dispatch.js
main().catch((error) => {
  writeError(error);
  process.exitCode = 1;
});
async function main() {
  const rawInput = await readStdin();
  const parsedInput = JSON.parse(rawInput);
  const envelope = normalizeHookInput(parsedInput, process.argv[2]);
  const config = loadConfig(envelope.cwd, process.env);
  const runtimeContext = resolveRuntimeContext(envelope.cwd, process.env, Date.now, {
    maxContextChars: config.maxContextChars,
    includeUserRules: config.includeUserRules
  });
  const output = await dispatchHookEvent({
    envelope,
    entries: BUILT_IN_REGISTRY,
    config,
    execute: (entry, currentEnvelope) => executeRegistryEntry({
      entry,
      envelope: currentEnvelope,
      runtimeContext,
      resolveBuiltInHookHandler: getBuiltInHookHandler
    })
  });
  writeOutput(output);
}
function readStdin() {
  return new Promise((resolve5, reject) => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("error", reject);
    process.stdin.on("end", () => {
      resolve5(input);
    });
  });
}
function writeOutput(output) {
  if (Object.keys(output).length === 0) {
    return;
  }
  process.stdout.write(`${JSON.stringify(output)}
`);
}
function writeError(error) {
  if (error instanceof HookInputError || error instanceof Error) {
    process.stderr.write(`${error.message}
`);
    return;
  }
  process.stderr.write("Unknown hook-pack CLI dispatch error\n");
}
