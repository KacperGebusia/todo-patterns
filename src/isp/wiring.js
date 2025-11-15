// src/isp/wiring.js
// Kompozycja (DI) dla ISP – tutaj tworzymy konkretne obiekty wąskich interfejsów
// oraz adaptery "grubych" interfejsów dla zachowania kompatybilności.

import {
  StoreTaskReader,
  StoreTaskWriter,
  StoreTaskCreator,
  StoreTaskUpdater,
  StoreTaskRemover,
  StoreTaskMover,
  StoreTaskBulkCloser,
  ExportCSV,
  ExportJSON,
  ExportICS,
  ToastNotifier,
  AlertNotifier,
  ConfirmDialog,
  ConsoleLogger,
} from "./impls";

import {
  TaskServiceAdapter,
  ExportServiceAdapter,
  NotifyServiceAdapter,
} from "./adapter-fat";

// ===== INSTANCJE WĄSKICH IMPLEMENTACJI =====

// Repozytorium zadań
const taskReader = new StoreTaskReader();
const taskWriter = new StoreTaskWriter();
const taskCreator = new StoreTaskCreator();
const taskUpdater = new StoreTaskUpdater();
const taskRemover = new StoreTaskRemover();
const taskMover = new StoreTaskMover();
const taskBulkCloser = new StoreTaskBulkCloser();

// Eksporterzy
const csvExporter = new ExportCSV();
const jsonExporter = new ExportJSON();
const icsExporter = new ExportICS();

// Notyfikacje
const toastNotifier = new ToastNotifier();
const alertNotifier = new AlertNotifier();
const confirmDialog = new ConfirmDialog();
const consoleLogger = new ConsoleLogger();

/**
 * Adaptery „grubych” interfejsów – przydatne, gdy stary kod oczekuje
 * ITaskServiceFat / IExportServiceFat / INotifyServiceFat.
 */
export const taskServiceFat = new TaskServiceAdapter(
  taskReader,
  taskWriter,
  taskCreator,
  taskUpdater,
  taskRemover,
  taskMover,
  taskBulkCloser
);

export const exportServiceFat = new ExportServiceAdapter(
  csvExporter,
  jsonExporter,
  icsExporter
);

export const notifyServiceFat = new NotifyServiceAdapter(
  toastNotifier,
  alertNotifier,
  confirmDialog,
  consoleLogger
);

// ===== MAŁE FUNKCJE POMOCNICZE (SRP) =====

async function readAllTasks() {
  return taskReader.list();
}

async function saveAllTasks(tasks) {
  return taskWriter.save(tasks);
}

function markDoneInStatus(tasks, status) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  return safeTasks.map((task) =>
    task.status === status
      ? { ...task, status: "done", completed: true }
      : task
  );
}

function filterDoneTasks(tasks) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  return safeTasks.filter(
    (task) => task.status === "done" || task.completed
  );
}

function getExporterByFormat(format) {
  const exporters = {
    csv: () => csvExporter.exportCSV,
    json: () => jsonExporter.exportJSON,
    ics: () => icsExporter.exportICS,
  };

  const exporterFactory = exporters[format] || exporters.csv;
  return exporterFactory();
}

function notifyBulkClose(status, closedCount) {
  toastNotifier.toast(
    "success",
    `Zamknięto ${closedCount} kart w kolumnie ${status}.`
  );
}

function notifyExport(format, exportedCount) {
  toastNotifier.toast(
    "info",
    `Wyeksportowano ${exportedCount} zakończonych kart (${format}).`
  );
}

// ===== PRZYPADKI UŻYCIA (ORKIESTRACJA) =====

/**
 * Przypadek użycia: zamknij wszystkie zadania w danym statusie (ISP).
 * Używa tylko wąskich interfejsów: reader + writer + toast.
 */
export async function closeAllInStatus(status) {
  const tasks = await readAllTasks();
  const closedTasks = markDoneInStatus(tasks, status);
  await saveAllTasks(closedTasks);

  const closedCount = closedTasks.filter(
    (task) => task.status === "done" || task.completed
  ).length;

  notifyBulkClose(status, closedCount);
}

/**
 * Przypadek użycia: eksport wszystkich ukończonych zadań w wybranym formacie.
 * Używa: reader + eksporter + toast.
 *
 * @param {'csv'|'json'|'ics'} format
 */
export async function exportDoneAs(format) {
  const tasks = await readAllTasks();
  const doneTasks = filterDoneTasks(tasks);

  const exporter = getExporterByFormat(format);
  const file = exporter(doneTasks);

  notifyExport(format, doneTasks.length);
  return file;
}
