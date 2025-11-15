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

// =====================
//   WĄSKIE SERWISY
// =====================

// Repozytorium zadań (ISP – małe interfejsy)
const reader = new StoreTaskReader();
const writer = new StoreTaskWriter();
const creator = new StoreTaskCreator();
const updater = new StoreTaskUpdater();
const remover = new StoreTaskRemover();
const mover = new StoreTaskMover();
const closer = new StoreTaskBulkCloser();

// Eksporterzy (CSV / JSON / ICS)
const csvExporter = new ExportCSV();
const jsonExporter = new ExportJSON();
const icsExporter = new ExportICS();

// Powiadomienia
const toastNotifier = new ToastNotifier();
const alertNotifier = new AlertNotifier();
const confirmDialog = new ConfirmDialog();
const logger = new ConsoleLogger();

// =====================
//   ADAPTERY "FAT"
// =====================

/**
 * Adaptery „grubych” interfejsów – przydatne, gdy stary kod oczekuje:
 * ITaskServiceFat / IExportServiceFat / INotifyServiceFat.
 * Nowy kod może korzystać wyłącznie z wąskich interfejsów, ale tu pokazujemy,
 * że można je złożyć w "grubą" wersję.
 */
export const taskServiceFat = new TaskServiceAdapter({
  reader,
  writer,
  creator,
  updater,
  remover,
  mover,
  bulkCloser: closer,
});

export const exportServiceFat = new ExportServiceAdapter({
  csv: csvExporter,
  json: jsonExporter,
  ics: icsExporter,
});

export const notifyServiceFat = new NotifyServiceAdapter({
  toast: toastNotifier,
  alert: alertNotifier,
  confirm: confirmDialog,
  log: logger,
});

// =====================
//   USE CASE'y ISP
// =====================

/**
 * Przypadek użycia: zamknij wszystkie zadania w danym statusie (ISP).
 * Używa tylko wąskich interfejsów reader + writer + toast.
 */
export async function closeAllInStatus(status) {
  const tasks = await reader.list();
  const next = tasks.map((task) =>
    task.status === status
      ? { ...task, status: "done", completed: true }
      : task
  );

  await writer.save(next);
  toastNotifier.toast(
    "success",
    `Zamknięto wszystkie karty w kolumnie ${status}.`
  );
}

/**
 * Przypadek użycia: eksport wszystkich ukończonych zadań w wybranym formacie.
 * Używa readera + odpowiedniego eksportera + toast.
 *
 * @param {"csv"|"json"|"ics"} format
 * @returns {{ mime: string, filename: string, data: string }}
 */
export async function exportDoneAs(format) {
  const tasks = await reader.list();
  const doneTasks = tasks.filter(
    (task) => task.status === "done" || task.completed
  );

  const exporters = {
    csv: () => csvExporter.exportCSV(doneTasks),
    json: () => jsonExporter.exportJSON(doneTasks),
    ics: () => icsExporter.exportICS(doneTasks),
  };

  const exporterFn = exporters[format] || exporters.csv;
  const file = exporterFn();

  toastNotifier.toast(
    "info",
    `Wyeksportowano ${doneTasks.length} kart (${format}).`
  );

  return file;
}
