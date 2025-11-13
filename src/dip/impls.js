// src/dip/impls.js
// KONKRETNE IMPLEMENTACJE niskopoziomowe (detale).
// DIP: warstwa wysokopoziomowa (use-cases) nie importuje tych klas bezpośrednio.

import { AbstractTaskRepository, AbstractNotifier, AbstractExporter } from "./abstracts";
import { uiBus } from "../mediator/UIBus";

/**
 * Implementacja repozytorium oparta o aktualny stan aplikacji (todoStore).
 * Zależności getState/setState są wstrzykiwane, żeby była możliwość podmiany.
 */
export class LocalStateTaskRepository extends AbstractTaskRepository {
  /**
   * @param {{ getState: ()=>any[], setState: (tasks: any[])=>Promise<void>|void }} deps
   */
  constructor({ getState, setState }){
    super();
    this.getState = getState;
    this.setState = setState;
  }

  /** Odczyt zadań z aktualnego stanu. */
  async listTasks(){
    return Array.isArray(this.getState()) ? this.getState() : [];
  }

  /** Zapis pełnej listy zadań do stanu. */
  async saveTasks(tasks){
    await this.setState(Array.isArray(tasks) ? tasks : []);
  }
}

/**
 * Implementacja notyfikatora, który wysyła zdarzenia na Mediator (uiBus),
 * a ToastHost w App.jsx pokazuje te powiadomienia jako toasty.
 */
export class ToastNotifier extends AbstractNotifier {
  notify(type, message){
    uiBus.emit("TOAST", { type, message });
  }
}

/**
 * Implementacja eksportera – generuje plik CSV z listy zadań.
 * To jest typowy „szczegół” – DIP pozwala go łatwo wymienić na inny.
 */
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
    // fileWithDate pochodzi z AbstractExporter
    return { mime: "text/csv", filename: this.fileWithDate("tasks", "csv"), data };
  }
}
