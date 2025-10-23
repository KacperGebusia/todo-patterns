// [PATTERN: Command] — usuwanie
import { ICommand } from "../Command";
export class RemoveTaskCommand extends ICommand { constructor(id){ super(); this.id = id; }
  meta(){ return { name:"RemoveTask", id:this.id }; } async do(store){ await store.remove(this.id); } }
