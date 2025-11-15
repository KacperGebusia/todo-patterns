// dip/impls.js

import {
  AbstractTaskRepository,
  AbstractNotifier,
  AbstractExporter,
} from "./abstracts";
import { uiBus } from "../mediator/UIBus";

// ===== IMPLEMENTACJA REPOZYTORIUM (DIP) =====

export class LocalStateTaskRepository extends AbstractTaskRepository {
  constructor({ getState, setState }) {
    super();
    this.getState = getState;
    this.setState = setState;
  }

  async listTasks() {
    const state = this.getState();
    return Array.isArray(state) ? state : [];
  }

  async saveTasks(tasks) {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    await this.setState(safeTasks);
  }
}

// ===== IMPLEMENTACJA NOTIFIERA (DIP) =====

export class ToastNotifier extends AbstractNotifier {
  notify(type, message) {
    uiBus.emit("TOAST", { type, message });
  }
}

// ===== IMPLEMENTACJA EKSPORTERA CSV (DIP) =====

function normalizeTasks(tasks) {
  return Array.isArray(tasks) ? tasks : [];
}

function buildCsvHeader() {
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

export class CsvExporter extends AbstractExporter {
  export(tasks) {
    const safeTasks = normalizeTasks(tasks);
    const headerRow = buildCsvHeader().join(",");

    const rows = safeTasks.map((task) =>
      buildCsvRowFromTask(task)
    );

    const csvText = [headerRow, ...rows].join("\n");

    return {
      mime: "text/csv",
      filename: this.createDatedFilename(
        "tasks",
        "csv"
      ),
      data: csvText,
    };
  }
}
