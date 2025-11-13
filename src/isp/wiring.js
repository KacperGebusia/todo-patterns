// src/isp/wiring.js
// Kompozycja (DI) dla ISP – tutaj tworzymy konkretne obiekty wąskich interfejsów
// oraz adaptery "grubych" interfejsów dla zachowania kompatybilności.

import {
  StoreTaskReader, StoreTaskWriter, StoreTaskCreator, StoreTaskUpdater,
  StoreTaskRemover, StoreTaskMover, StoreTaskBulkCloser,
  ExportCSV, ExportJSON, ExportICS,
  ToastNotifier, AlertNotifier, ConfirmDialog, ConsoleLogger
} from "./impls";

import {
  TaskServiceAdapter,
  ExportServiceAdapter,
  NotifyServiceAdapter
} from "./adapter-fat";

// Tworzymy wyspecjalizowane implementacje repozytorium zadań.
const reader  = new StoreTaskReader();
const writer  = new StoreTaskWriter();
const creator = new StoreTaskCreator();
const updater = new StoreTaskUpdater();
const remover = new StoreTaskRemover();
const mover   = new StoreTaskMover();
const closer  = new StoreTaskBulkCloser();

// Tworzymy wyspecjalizowane eksporterzy.
const csv = new ExportCSV();
const json = new ExportJSON();
const ics = new ExportICS();

// Tworzymy wyspecjalizowane notyfikatory.
const toast = new ToastNotifier();
const alertN = new AlertNotifier();
const confirmN = new ConfirmDialog();
const logN = new ConsoleLogger();

/**
 * Adaptery „grubych” interfejsów – przydatne, gdy stary kod oczekuje ITaskServiceFat / IExportServiceFat / INotifyServiceFat.
 * Nowy kod może korzystać wyłącznie z wąskich interfejsów, ale tu pokazujemy, że można je złożyć w "grubą" wersję.
 */
export const taskServiceFat = new TaskServiceAdapter(reader, writer, creator, updater, remover, mover, closer);
export const exportServiceFat = new ExportServiceAdapter(csv, json, ics);
export const notifyServiceFat = new NotifyServiceAdapter(toast, alertN, confirmN, logN);

/**
 * Przypadek użycia: zamknij wszystkie zadania w danym statusie (ISP).
 * Używa tylko wąskich interfejsów reader + writer + toast (wysokopoziomowa funkcja).
 */
export async function closeAllInStatus(status){
  const tasks = await reader.list();
  const next = tasks.map(t =>
    t.status === status ? ({ ...t, status: "done", completed: true }) : t
  );
  await writer.save(next);
  toast.toast("success", `Zamknięto wszystkie karty w kolumnie ${status}.`);
}

/**
 * Przypadek użycia: eksport wszystkich ukończonych zadań w wybranym formacie.
 * Używa readera + odpowiedniego eksporter + toast.
 */
export async function exportDoneAs(format /* 'csv'|'json'|'ics' */){
  const tasks = await reader.list();
  const done = tasks.filter(t => t.status === "done" || t.completed);

  // Mapa formatu na funkcję eksportującą.
  const map = {
    csv: () => csv.exportCSV(done),
    json: () => json.exportJSON(done),
    ics: () => ics.exportICS(done),
  };

  const exporter = map[format] || map.csv;
  const f = exporter();
  toast.toast("info", `Wyeksportowano ${done.length} kart (${format})`);
  return f;
}
