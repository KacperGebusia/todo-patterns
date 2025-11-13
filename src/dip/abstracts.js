// src/dip/abstracts.js
// Klasy ABSTRAKCYJNE, które rozszerzają interfejsy o wspólne helpery.
// Dalej nie ma żadnych detali implementacyjnych (tylko logika pomocnicza).

import { ITaskRepository, INotifier, IExporter } from "./contracts";

/**
 * Abstrakcyjne repozytorium – dodaje metody pomocnicze do interfejsu.
 */
export class AbstractTaskRepository extends ITaskRepository {
  /**
   * Prosty helper do filtrowania zadań.
   * Dzięki temu implementacje repozytorium mogą współdzielić tę logikę.
   */
  filter(tasks, pred){
    return Array.isArray(tasks) ? tasks.filter(pred) : [];
  }
}

/**
 * Abstrakcyjny notifier – dodaje metody skrótowe info/success/error,
 * które opierają się na bazowej metodzie notify(type, message).
 */
export class AbstractNotifier extends INotifier {
  info(msg){ this.notify("info", msg); }
  success(msg){ this.notify("success", msg); }
  error(msg){ this.notify("error", msg); }
}

/**
 * Abstrakcyjny eksporter – helper do generowania nazw plików z datą.
 */
export class AbstractExporter extends IExporter {
  fileWithDate(prefix, ext){
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    return `${prefix}-${ts}.${ext}`;
  }
}
