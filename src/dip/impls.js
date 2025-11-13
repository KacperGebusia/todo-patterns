import { AbstractTaskRepository, AbstractNotifier, AbstractExporter } from "./abstracts";
import { uiBus } from "../mediator/UIBus";

export class LocalStateTaskRepository extends AbstractTaskRepository {
  constructor({ getState, setState }){
    super();
    this.getState = getState;
    this.setState = setState;
  }
  async listTasks(){ return Array.isArray(this.getState()) ? this.getState() : []; }
  async saveTasks(tasks){ await this.setState(Array.isArray(tasks) ? tasks : []); }
}

export class ToastNotifier extends AbstractNotifier {
  notify(type, message){
    uiBus.emit("TOAST", { type, message });
  }
}

export class CsvExporter extends AbstractExporter {
  export(tasks){
    const safe = Array.isArray(tasks) ? tasks : [];
    const header = ["id","title","status","type","createdAt","completed","order","priority","due","tags"];
    const lines = [header.join(",")];
    safe.forEach(t => {
      const row = [
        t.id,
        (t.title||"").replaceAll('"','""'),
        t.status,
        t.type,
        t.createdAt ?? "",
        t.completed ? "1" : "0",
        t.order ?? "",
        t.meta?.priority ?? "",
        t.meta?.due ?? "",
        (t.meta?.tags||[]).join("|")
      ].map(v => typeof v === "string" ? `"${v}"` : String(v));
      lines.push(row.join(","));
    });
    const data = lines.join("\n");
    return { mime: "text/csv", filename: this.fileWithDate("tasks", "csv"), data };
  }
}
