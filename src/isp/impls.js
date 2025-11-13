// src/isp/impls.js
// Konkretne implementacje WĄSKICH interfejsów (po segregacji).
// Każda klasa robi dokładnie jedną rzecz (albo ma bardzo wąski zakres odpowiedzialności).

import { todoStore } from "../store";
import { uiBus } from "../mediator/UIBus";
import {
  ITaskReader, ITaskWriter, ITaskCreator, ITaskUpdater, ITaskRemover, ITaskMover, ITaskBulkCloser,
  IExportCSV, IExportJSON, IExportICS,
  IToast, IAlert, IConfirm, ILog
} from "./segregated";

/* ===================== */
/*   Repozytorium zadań  */
/* ===================== */

/** Implementacja tylko odczytu zadań – korzysta z todoStore. */
export class StoreTaskReader extends ITaskReader {
  async list(){
    return Array.isArray(todoStore.state) ? todoStore.state : [];
  }
}

/** Implementacja tylko zapisu pełnej listy zadań – używa restoreSnapshot. */
export class StoreTaskWriter extends ITaskWriter {
  async save(tasks){
    await todoStore.restoreSnapshot({ data: Array.isArray(tasks) ? tasks : [] });
  }
}

/** Implementacja tylko tworzenia pojedynczego zadania. */
export class StoreTaskCreator extends ITaskCreator {
  async create(task){
    await todoStore.createIn(task.status ?? "todo", task);
  }
}

/** Implementacja tylko aktualizacji zadania. */
export class StoreTaskUpdater extends ITaskUpdater {
  async update(id, patch){
    await todoStore.update(id, patch);
  }
}

/** Implementacja tylko usuwania zadania. */
export class StoreTaskRemover extends ITaskRemover {
  async remove(id){
    await todoStore.remove(id);
  }
}

/** Implementacja tylko przenoszenia kart między kolumnami. */
export class StoreTaskMover extends ITaskMover {
  async move(id, toStatus, toIndex){
    await todoStore.moveCard(id, toStatus, toIndex);
  }
}

/**
 * Implementacja tylko operacji masowego zamykania zadań.
 * Dla prostoty korzysta z czytnika i pisarza – moglibyśmy wstrzyknąć je przez konstruktor.
 */
export class StoreTaskBulkCloser extends ITaskBulkCloser {
  async bulkClose(status){
    const reader = new StoreTaskReader();
    const writer = new StoreTaskWriter();
    const tasks = await reader.list();
    const next = tasks.map(t =>
      t.status === status ? ({ ...t, status: "done", completed: true }) : t
    );
    await writer.save(next);
  }
}

/* ===================== */
/*        Eksport        */
/* ===================== */

/** Eksporter do CSV – implementacja wąskiego interfejsu IExportCSV. */
export class ExportCSV extends IExportCSV {
  exportCSV(tasks){
    const safe = Array.isArray(tasks) ? tasks : [];
    const header = ["id","title","status","type","createdAt","completed","order","priority","due","tags"];

    const rows = safe.map(t => [
      t.id,
      (t.title || "").replaceAll('"','""'),
      t.status,
      t.type,
      t.createdAt ?? "",
      t.completed ? "1" : "0",
      t.order ?? "",
      t.meta?.priority ?? "",
      t.meta?.due ?? "",
      (t.meta?.tags || []).join("|")
    ].map(v => typeof v === "string" ? `"${v}"` : String(v)).join(","));

    const csv = [header.join(","), ...rows].join("\n");
    return { mime: "text/csv", filename: `tasks-${Date.now()}.csv`, data: csv };
  }
}

/** Eksporter do JSON – implementacja IExportJSON. */
export class ExportJSON extends IExportJSON {
  exportJSON(tasks){
    const json = JSON.stringify(Array.isArray(tasks) ? tasks : [], null, 2);
    return { mime: "application/json", filename: `tasks-${Date.now()}.json`, data: json };
  }
}

/** Eksporter do ICS (format kalendarza). */
export class ExportICS extends IExportICS {
  exportICS(tasks){
    const safe = Array.isArray(tasks) ? tasks : [];
    const icsLines = ["BEGIN:VCALENDAR", "VERSION:2.0"];

    safe.forEach(t => {
      if (!t?.meta?.due) return;
      // Konwersja ISO → format bez myślników i dwukropków, wymagany przez ICS
      const dt = new Date(t.meta.due).toISOString()
        .replace(/[-:]/g,"")
        .replace(/\.\d{3}Z$/,"Z");

      icsLines.push("BEGIN:VEVENT");
      icsLines.push(`UID:${t.id}`);
      icsLines.push(`DTSTAMP:${dt}`);
      icsLines.push(`DTSTART:${dt}`);
      icsLines.push(`SUMMARY:${(t.title || "Task").replace(/\n/g," ")}`);
      icsLines.push("END:VEVENT");
    });

    icsLines.push("END:VCALENDAR");

    return { mime: "text/calendar", filename: `tasks-${Date.now()}.ics`, data: icsLines.join("\n") };
  }
}

/* ===================== */
/*     Powiadomienia     */
/* ===================== */

/** Notifier, który pokazuje toasty przez Mediator (uiBus). */
export class ToastNotifier extends IToast {
  toast(type, msg){
    uiBus.emit("TOAST", { type, message: msg });
  }
}

/** Notifier oparty na window.alert (blokujące okienko). */
export class AlertNotifier extends IAlert {
  alert(msg){
    window.alert(msg);
  }
}

/** Notifier oparty na window.confirm, zwraca boolean. */
export class ConfirmDialog extends IConfirm {
  confirm(q){
    return window.confirm(q);
  }
}

/** Logger wypisujący komunikaty do konsoli. */
export class ConsoleLogger extends ILog {
  log(msg){
    console.log("[ISP]", msg);
  }
}
