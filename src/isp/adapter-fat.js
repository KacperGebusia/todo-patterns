// src/isp/adapter-fat.js
// Adaptery, które budują "grube" interfejsy z fat.js na podstawie wąskich interfejsów z segregated.js.

import { ITaskServiceFat, IExportServiceFat, INotifyServiceFat } from "./fat";
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

/**
 * Adapter "grubego" serwisu zadań na zestaw małych interfejsów repozytorium.
 * Przyjmuje JEDEN obiekt konfiguracyjny zamiast 7 osobnych argumentów.
 */
export class TaskServiceAdapter extends ITaskServiceFat {
  /**
   * @param {{ reader: ITaskReader, writer: ITaskWriter, creator: ITaskCreator,
   *           updater: ITaskUpdater, remover: ITaskRemover,
   *           mover: ITaskMover, bulkCloser: ITaskBulkCloser }} deps
   */
  constructor(deps) {
    super();
    this.reader = deps.reader;
    this.writer = deps.writer;
    this.creator = deps.creator;
    this.updater = deps.updater;
    this.remover = deps.remover;
    this.mover = deps.mover;
    this.bulkCloser = deps.bulkCloser;
  }

  async list()       { return this.reader.list(); }
  async save(tasks)  { return this.writer.save(tasks); }
  async create(task) { return this.creator.create(task); }
  async update(id, patch) { return this.updater.update(id, patch); }
  async remove(id)         { return this.remover.remove(id); }
  async move(id, toStatus, toIndex) {
    return this.mover.move(id, toStatus, toIndex);
  }
  async bulkClose(status)  { return this.bulkCloser.bulkClose(status); }
}

/**
 * Adapter "grubego" serwisu eksportu na osobne eksporterzy (CSV, JSON, ICS).
 * Też przyjmuje jeden obiekt zależności.
 */
export class ExportServiceAdapter extends IExportServiceFat {
  /**
   * @param {{ csv: IExportCSV, json: IExportJSON, ics: IExportICS }} deps
   */
  constructor(deps) {
    super();
    this.csv = deps.csv;
    this.json = deps.json;
    this.ics = deps.ics;
  }

  exportCSV(tasks)  { return this.csv.exportCSV(tasks); }
  exportJSON(tasks) { return this.json.exportJSON(tasks); }
  exportICS(tasks)  { return this.ics.exportICS(tasks); }
}

/**
 * Adapter "grubego" serwisu powiadomień na zestaw prostszych interfejsów:
 * IToast, IAlert, IConfirm, ILog.
 */
export class NotifyServiceAdapter extends INotifyServiceFat {
  /**
   * @param {{ toast: IToast, alert: IAlert, confirm: IConfirm, log: ILog }} deps
   */
  constructor(deps) {
    super();
    this.toast = deps.toast;
    this.alert = deps.alert;
    this.confirmDialog = deps.confirm;
    this.logger = deps.log;
  }

  toast(type, msg)   { this.toast.toast(type, msg); }
  alert(msg)         { this.alert.alert(msg); }
  confirm(question)  { return this.confirmDialog.confirm(question); }
  log(msg)           { this.logger.log(msg); }
}
