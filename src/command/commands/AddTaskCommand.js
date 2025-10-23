// [PATTERN: Command] — dodawanie
import { ICommand } from "../Command";
export class AddTaskCommand extends ICommand { constructor(task, status) { super(); this.task = task; this.status = status ?? task.status ?? "todo"; }
  meta(){ return { name:"AddTask", title: this.task?.title }; } async do(store){ await store.createIn(this.status, this.task); } }
