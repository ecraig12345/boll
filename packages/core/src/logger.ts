type MessagePrinter = (msg: string) => void;
export class Logger {
  constructor(
    private logPrinter: MessagePrinter,
    private warnPrinter: MessagePrinter,
    private errorPrinter: MessagePrinter
  ) {}

  log(msg: string) {
    this.logPrinter(msg);
  }

  warn(msg: string) {
    this.warnPrinter(msg);
  }

  error(msg: string) {
    this.errorPrinter(msg);
  }
}

export const DefaultLogger = new Logger(console.log, console.warn, console.error);
const empty = () => {
  // no-op
};
export const NullLogger = new Logger(empty, empty, empty);
