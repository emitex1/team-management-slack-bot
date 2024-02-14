export enum Colors {
  black = "\x1b[30m",
  red = "\x1b[31m",
  green = "\x1b[32m",
  yellow = "\x1b[33m",
  blue = "\x1b[34m",
  magenta = "\x1b[35m",
  cyan = "\x1b[36m",
  white = "\x1b[37m",
}

const otherTags = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
};

export const elog = (...args: unknown[]) => {
  const prefix = ">>> Log >>> ";
  console.log(Colors.red, prefix, otherTags.reset, ...args);
};

export const elogRed = (...args: unknown[]) => {
  console.log(Colors.red, ...args, otherTags.reset);
};

export const elogGreen = (...args: unknown[]) => {
  console.log(Colors.green, ...args, otherTags.reset);
};

export const elogYellow = (...args: unknown[]) => {
  console.log(Colors.yellow, ...args, otherTags.reset);
};

export const elogColored = (customColor: Colors, ...args: unknown[]) => {
  console.log(customColor, ...args, otherTags.reset);
};
