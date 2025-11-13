// src/command/commands.js
// Zestaw podstawowych komend. Każda implementuje: async do(store){...}
// Undo/Redo realizuje CommandBus przez snapshoty (Memento).

// Tworzenie zadania w określonym statusie.
export class CreateInCommand {
  constructor(status, task) {
    this.targetStatus = status;
    this.task = task;
  }

  async do(store) {
    await store.createIn(this.targetStatus, this.task);
  }
}

// Usuwanie zadania.
export class RemoveTaskCommand {
  constructor(id) {
    this.taskId = id;
  }

  async do(store) {
    await store.remove(this.taskId);
  }
}

// Aktualizacja zadania (patch lub cały obiekt).
export class UpdateTaskCommand {
  constructor(id, patchOrWhole) {
    this.taskId = id;
    this.patchOrWhole = patchOrWhole;
  }

  async do(store) {
    await store.update(this.taskId, this.patchOrWhole);
  }
}

// Przełączanie completed.
export class ToggleTaskCommand {
  constructor(id) {
    this.taskId = id;
  }

  async do(store) {
    await store.toggle(this.taskId);
  }
}

// Przenoszenie karty między kolumnami Kanban.
export class MoveCardCommand {
  constructor(id, toStatus, toIndex) {
    this.taskId = id;
    this.targetStatus = toStatus;
    this.targetIndex = toIndex;
  }

  async do(store) {
    await store.moveCard(
      this.taskId,
      this.targetStatus,
      this.targetIndex
    );
  }
}
