// src/command/commands/SwitchBackendCommand.js
// [PATTERN: Command] — Zmiana backendu persystencji

import { ICommand } from "../Command";

export class SwitchBackendCommand extends ICommand {
  constructor(backendKind) {
    super();
    this.backendKind = backendKind;
  }

  meta() {
    return {
      name: "SwitchBackend",
      backend: this.backendKind,
    };
  }

  async do(store) {
    await store.setBackend(this.backendKind);
  }
}
