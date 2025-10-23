// Zestaw podstawowych komend. Każda implementuje: async do(store){...}
// Undo/Redo realizuje CommandBus przez snapshoty (Memento).

export class CreateInCommand {
  constructor(status, task){ this.status = status; this.task = task; }
  async do(store){ await store.createIn(this.status, this.task); }
}

export class RemoveTaskCommand {
  constructor(id){ this.id = id; }
  async do(store){ await store.remove(this.id); }
}

export class UpdateTaskCommand {
  constructor(id, patchOrWhole){ this.id = id; this.patchOrWhole = patchOrWhole; }
  async do(store){ await store.update(this.id, this.patchOrWhole); }
}

export class ToggleTaskCommand {
  constructor(id){ this.id = id; }
  async do(store){ await store.toggle(this.id); }
}

export class MoveCardCommand {
  constructor(id, toStatus, toIndex){ this.id = id; this.toStatus = toStatus; this.toIndex = toIndex; }
  async do(store){ await store.moveCard(this.id, this.toStatus, this.toIndex); }
}
