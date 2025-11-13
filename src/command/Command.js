// src/command/Command.js
// [PATTERN: Command] — interfejs bazowy dla wszystkich komend.

/**
 * Bazowy interfejs komendy.
 * Każda komenda musi implementować metodę async do(store).
 */
export class ICommand {
  async do() {
    throw new Error("ICommand.do not implemented");
  }

  /**
   * Metadane komendy – nazwa klasy, można rozszerzyć o więcej pól.
   */
  meta() {
    return { name: this.constructor.name };
  }
}
