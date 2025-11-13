// src/command/commands/MoveCardCommand.js
// [PATTERN: Command] — Przeniesienie karty między kolumnami

import { ICommand } from "../Command";

export class MoveCardCommand extends ICommand {
  constructor(taskId, targetStatus, targetIndex) {
    super();
    this.taskId = taskId;
    this.targetStatus = targetStatus;
    this.targetIndex = targetIndex;
  }

  meta() {
    return {
      name: "MoveCard",
      id: this.taskId,
      toStatus: this.targetStatus,
      toIndex: this.targetIndex,
    };
  }

  async do(store) {
    await store.moveCard(this.taskId, this.targetStatus, this.targetIndex);
  }
}
