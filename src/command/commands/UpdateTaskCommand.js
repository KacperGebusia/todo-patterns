// src/command/commands/UpdateTaskCommand.js
// [PATTERN: Command] — Aktualizacja zadania

import { ICommand } from "../Command";

export class UpdateTaskCommand extends ICommand {
  constructor(taskId, patchOrWhole) {
    super();
    this.taskId = taskId;
    this.patch = patchOrWhole;
  }

  meta() {
    return {
      name: "UpdateTask",
      id: this.taskId,
    };
  }

  async do(store) {
    await store.update(this.taskId, this.patch);
  }
}
