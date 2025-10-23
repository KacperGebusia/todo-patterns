// [PATTERN: Command] — zmiana backendu
import { ICommand } from "../Command";
export class SwitchBackendCommand extends ICommand { constructor(kind){ super(); this.kind = kind; }
  meta(){ return { name:"SwitchBackend", to:this.kind }; } async do(store){ await store.setBackend(this.kind); } }
