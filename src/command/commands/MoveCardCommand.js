// [PATTERN: Command] — przeniesienie
import { ICommand } from "../Command";
export class MoveCardCommand extends ICommand { constructor(id, toStatus, toIndex){ super(); this.id=id; this.toStatus=toStatus; this.toIndex=toIndex; }
  meta(){ return { name:"MoveCard", id:this.id, to:this.toStatus, idx:this.toIndex }; } async do(store){ await store.moveCard(this.id, this.toStatus, this.toIndex); } }
