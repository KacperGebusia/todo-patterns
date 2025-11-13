// src/command/commands/RemoveTaskCommand.js
// [PATTERN: Command] — Usuwanie zadania

import { ICommand } from "../Command";

export class RemoveTaskCommand extends ICommand {
  constructor(taskId) {
    super();
    this.taskId = taskId;
  }

  meta() {
    return {
      name: "RemoveTask",
      id: this.taskId,
    };
  }

  async do(store) {
    await store.remove(this.taskId);
  }
}
