// src/isp/impls.js

// Zad 3.3 Zasada segregacji interfejsów
// implementacje wąskich interfejsów

// Konkretne implementacje WĄSKICH interfejsów (po segregacji).
// Każda klasa robi dokładnie jedną rzecz (albo ma bardzo wąski zakres odpowiedzialności).


import { todoStore } from "../store";
import { uiBus } from "../mediator/UIBus";
import {
  ITaskReader,
  ITaskWriter,
  ITaskCreator,
  ITaskUpdater,
  ITaskRemover,
  ITaskMover,
  ITaskBulkCloser,
  IExportCSV,
  IExportJSON,
  IExportICS,
  IToast,
  IAlert,
  IConfirm,
  ILog,
} from "./segregated";

/* ===================== */
/*   Repozytorium zadań  */
/* ===================== */

/** Implementacja tylko odczytu zadań – korzysta z todoStore. */
export class StoreTaskReader extends ITaskReader {
  async list() {
    return Array.isArray(todoStore.state) ? todoStore.state : [];
  }
}

/** Implementacja tylko zapisu pełnej listy zadań – używa restoreSnapshot. */
export class StoreTaskWriter extends ITaskWriter {
  async save(tasks) {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    await todoStore.restoreSnapshot({ data: safeTasks });
  }
}

/** Implementacja tylko tworzenia pojedynczego zadania. */
export class StoreTaskCreator extends ITaskCreator {
  async create(task) {
    const targetStatus = task.status ?? "todo";
    await todoStore.createIn(targetStatus, task);
  }
}

/** Implementacja tylko aktualizacji zadania. */
export class StoreTaskUpdater extends ITaskUpdater {
  async update(id, patch) {
    await todoStore.update(id, patch);
  }
}

/** Implementacja tylko usuwania zadania. */
export class StoreTaskRemover extends ITaskRemover {
  async remove(id) {
    await todoStore.remove(id);
  }
}

/** Implementacja tylko przenoszenia kart między kolumnami. */
export class StoreTaskMover extends ITaskMover {
  async move(id, toStatus, toIndex) {
    await todoStore.moveCard(id, toStatus, toIndex);
  }
}

/**
 * Implementacja tylko operacji masowego zamykania zadań.
 * Dla prostoty korzysta z czytnika i pisarza – moglibyśmy wstrzyknąć je przez konstruktor.
 */
export class StoreTaskBulkCloser extends ITaskBulkCloser {
  async bulkClose(status) {
    const tasks = await this.readAllTasks();
    const closedTasks = this.markDoneInStatus(tasks, status);
    await this.saveAllTasks(closedTasks);
  }

  async readAllTasks() {
    const reader = new StoreTaskReader();
    return reader.list();
  }

  markDoneInStatus(tasks, status) {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.map((task) =>
      task.status === status
        ? { ...task, status: "done", completed: true }
        : task
    );
  }

  async saveAllTasks(tasks) {
    const writer = new StoreTaskWriter();
    await writer.save(tasks);
  }
}

/* ===================== */
/*        Eksport        */
/* ===================== */

function normalizeExportTasks(tasks) {
  return Array.isArray(tasks) ? tasks : [];
}

function buildCsvHeaderRow() {
  return [
    "id",
    "title",
    "status",
    "type",
    "createdAt",
    "completed",
    "order",
    "priority",
    "due",
    "tags",
  ];
}

function escapeCsvField(value) {
  if (typeof value !== "string") {
    return String(value ?? "");
  }
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

function buildCsvRowFromTask(task) {
  const fields = [
    task.id,
    task.title || "",
    task.status,
    task.type,
    task.createdAt ?? "",
    task.completed ? "1" : "0",
    task.order ?? "",
    task.meta?.priority ?? "",
    task.meta?.due ?? "",
    (task.meta?.tags || []).join("|"),
  ];
  return fields.map(escapeCsvField).join(",");
}

/** Eksporter do CSV – implementacja wąskiego interfejsu IExportCSV. */
export class ExportCSV extends IExportCSV {
  exportCSV(tasks) {
    const safeTasks = normalizeExportTasks(tasks);
    const header = buildCsvHeaderRow().join(",");

    const rows = safeTasks.map((task) =>
      buildCsvRowFromTask(task)
    );

    const csvContent = [header, ...rows].join("\n");
    return {
      mime: "text/csv",
      filename: `tasks-${Date.now()}.csv`,
      data: csvContent,
    };
  }
}

/** Eksporter do JSON – implementacja IExportJSON. */
export class ExportJSON extends IExportJSON {
  exportJSON(tasks) {
    const safeTasks = normalizeExportTasks(tasks);
    const json = JSON.stringify(safeTasks, null, 2);
    return {
      mime: "application/json",
      filename: `tasks-${Date.now()}.json`,
      data: json,
    };
  }
}

function buildIcsHeaderLines() {
  return ["BEGIN:VCALENDAR", "VERSION:2.0"];
}

function formatIsoToIcsDate(isoString) {
  return new Date(isoString)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function buildIcsEventLines(task) {
  if (!task?.meta?.due) {
    return [];
  }

  const formattedDate = formatIsoToIcsDate(task.meta.due);
  const summary = (task.title || "Task").replace(/\n/g, " ");

  return [
    "BEGIN:VEVENT",
    `UID:${task.id}`,
    `DTSTAMP:${formattedDate}`,
    `DTSTART:${formattedDate}`,
    `SUMMARY:${summary}`,
    "END:VEVENT",
  ];
}

function buildIcsFooterLines() {
  return ["END:VCALENDAR"];
}

/** Eksporter do ICS (format kalendarza). */
export class ExportICS extends IExportICS {
  exportICS(tasks) {
    const safeTasks = normalizeExportTasks(tasks);

    const lines = [...buildIcsHeaderLines()];

    safeTasks.forEach((task) => {
      const eventLines = buildIcsEventLines(task);
      lines.push(...eventLines);
    });

    lines.push(...buildIcsFooterLines());

    const data = lines.join("\n");
    return {
      mime: "text/calendar",
      filename: `tasks-${Date.now()}.ics`,
      data,
    };
  }
}

/* ===================== */
/*     Powiadomienia     */
/* ===================== */

/** Notifier, który pokazuje toasty przez Mediator (uiBus). */
export class ToastNotifier extends IToast {
  toast(type, message) {
    uiBus.emit("TOAST", { type, message });
  }
}

/** Notifier oparty na window.alert (blokujące okienko). */
export class AlertNotifier extends IAlert {
  alert(message) {
    window.alert(message);
  }
}

/** Notifier oparty na window.confirm, zwraca boolean. */
export class ConfirmDialog extends IConfirm {
  confirm(question) {
    return window.confirm(question);
  }
}

/** Logger wypisujący komunikaty do konsoli. */
export class ConsoleLogger extends ILog {
  log(message) {
    console.log("[ISP]", message);
  }
}
