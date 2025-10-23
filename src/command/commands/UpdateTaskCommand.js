// [PATTERN: Command] — aktualizacja
import { ICommand } from "../Command";
export class UpdateTaskCommand extends ICommand { constructor(id, patchOrWhole) { super(); this.id = id; this.patchOrWhole = patchOrWhole; }
  meta(){ return { name:"UpdateTask", id:this.id }; } async do(store){ await store.update(this.id, this.patchOrWhole); } }
