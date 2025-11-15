// src/isp/adapter-fat.js
// Adaptery, które budują "grube" interfejsy z fat.js na podstawie wąskich interfejsów z segregated.js.
// Pokazuje to, że można zachować kompatybilność ze starym API, a nowy kod korzysta już z małych kontraktów.

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
 * Zamiast jednej klasy implementującej wszystko, składamy go z wyspecjalizowanych obiektów.
 */
export class TaskServiceAdapter extends ITaskServiceFat {
  /**
   * @param {ITaskReader} taskReader
   * @param {ITaskWriter} taskWriter
   * @param {ITaskCreator} taskCreator
   * @param {ITaskUpdater} taskUpdater
   * @param {ITaskRemover} taskRemover
   * @param {ITaskMover} taskMover
   * @param {ITaskBulkCloser} taskBulkCloser
   */
  constructor(
    taskReader,
    taskWriter,
    taskCreator,
    taskUpdater,
    taskRemover,
    taskMover,
    taskBulkCloser
  ) {
    super();
    this.taskReader = taskReader;
    this.taskWriter = taskWriter;
    this.taskCreator = taskCreator;
    this.taskUpdater = taskUpdater;
    this.taskRemover = taskRemover;
    this.taskMover = taskMover;
    this.taskBulkCloser = taskBulkCloser;
  }

  async list() {
    return this.taskReader.list();
  }

  async save(tasks) {
    return this.taskWriter.save(tasks);
  }

  async create(task) {
    return this.taskCreator.create(task);
  }

  async update(id, patch) {
    return this.taskUpdater.update(id, patch);
  }

  async remove(id) {
    return this.taskRemover.remove(id);
  }

  async move(id, toStatus, toIndex) {
    return this.taskMover.move(id, toStatus, toIndex);
  }

  async bulkClose(status) {
    return this.taskBulkCloser.bulkClose(status);
  }
}

/**
 * Adapter "grubego" serwisu eksportu na osobne eksporterzy (CSV, JSON, ICS).
 */
export class ExportServiceAdapter extends IExportServiceFat {
  /**
   * @param {IExportCSV} csvExporter
   * @param {IExportJSON} jsonExporter
   * @param {IExportICS} icsExporter
   */
  constructor(csvExporter, jsonExporter, icsExporter) {
    super();
    this.csvExporter = csvExporter;
    this.jsonExporter = jsonExporter;
    this.icsExporter = icsExporter;
  }

  exportCSV(tasks) {
    return this.csvExporter.exportCSV(tasks);
  }

  exportJSON(tasks) {
    return this.jsonExporter.exportJSON(tasks);
  }

  exportICS(tasks) {
    return this.icsExporter.exportICS(tasks);
  }
}

/**
 * Adapter "grubego" serwisu powiadomień na zestaw prostszych interfejsów:
 * IToast, IAlert, IConfirm, ILog.
 */
export class NotifyServiceAdapter extends INotifyServiceFat {
  /**
   * @param {IToast} toastNotifier
   * @param {IAlert} alertNotifier
   * @param {IConfirm} confirmDialog
   * @param {ILog} logger
   */
  constructor(toastNotifier, alertNotifier, confirmDialog, logger) {
    super();
    this.toastNotifier = toastNotifier;
    this.alertNotifier = alertNotifier;
    this.confirmDialog = confirmDialog;
    this.logger = logger;
  }

  toast(type, message) {
    this.toastNotifier.toast(type, message);
  }

  alert(message) {
    this.alertNotifier.alert(message);
  }

  confirm(question) {
    return this.confirmDialog.confirm(question);
  }

  log(message) {
    this.logger.log(message);
  }
}
