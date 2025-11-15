// src/command/commands/AddTaskCommand.js
// [PATTERN: Command] — Dodawanie nowego zadania

import { ICommand } from "../Command";

export class AddTaskCommand extends ICommand {
  constructor(task, initialStatus) {
    super();
    this.task = task;
    this.targetStatus = initialStatus ?? task.status ?? "todo";
  }

  meta() {
    return {
      name: "AddTask",
      title: this.task?.title,
      status: this.targetStatus,
    };
  }

  async do(store) {
    await store.createIn(this.targetStatus, this.task);
  }
}
