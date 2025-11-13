// src/isp/adapter-fat.js
// Adaptery, które budują "grube" interfejsy z fat.js na podstawie wąskich interfejsów z segregated.js.
// Pokazuje to, że można zachować kompatybilność ze starym API, a nowy kod korzysta już z małych kontraktów.

import { ITaskServiceFat, IExportServiceFat, INotifyServiceFat } from "./fat";
import {
  ITaskReader, ITaskWriter, ITaskCreator, ITaskUpdater, ITaskRemover, ITaskMover, ITaskBulkCloser,
  IExportCSV, IExportJSON, IExportICS,
  IToast, IAlert, IConfirm, ILog
} from "./segregated";

/**
 * Adapter "grubego" serwisu zadań na zestaw małych interfejsów repozytorium.
 * Zamiast jednej klasy implementującej wszystko, składamy go z wyspecjalizowanych obiektów.
 */
export class TaskServiceAdapter extends ITaskServiceFat {
  /**
   * @param {ITaskReader} r
   * @param {ITaskWriter} w
   * @param {ITaskCreator} c
   * @param {ITaskUpdater} u
   * @param {ITaskRemover} rm
   * @param {ITaskMover} m
   * @param {ITaskBulkCloser} bc
   */
  constructor(r, w, c, u, rm, m, bc){
    super();
    this.r = r;
    this.w = w;
    this.c = c;
    this.u = u;
    this.rm = rm;
    this.m = m;
    this.bc = bc;
  }

  async list(){ return this.r.list(); }
  async save(tasks){ return this.w.save(tasks); }
  async create(task){ return this.c.create(task); }
  async update(id, patch){ return this.u.update(id, patch); }
  async remove(id){ return this.rm.remove(id); }
  async move(id, toStatus, toIndex){ return this.m.move(id, toStatus, toIndex); }
  async bulkClose(status){ return this.bc.bulkClose(status); }
}

/**
 * Adapter "grubego" serwisu eksportu na osobne eksporterzy (CSV, JSON, ICS).
 */
export class ExportServiceAdapter extends IExportServiceFat {
  /**
   * @param {IExportCSV} c
   * @param {IExportJSON} j
   * @param {IExportICS} i
   */
  constructor(c, j, i){
    super();
    this.c = c;
    this.j = j;
    this.i = i;
  }

  exportCSV(tasks){ return this.c.exportCSV(tasks); }
  exportJSON(tasks){ return this.j.exportJSON(tasks); }
  exportICS(tasks){ return this.i.exportICS(tasks); }
}

/**
 * Adapter "grubego" serwisu powiadomień na zestaw prostszych interfejsów:
 * IToast, IAlert, IConfirm, ILog.
 */
export class NotifyServiceAdapter extends INotifyServiceFat {
  /**
   * @param {IToast} t
   * @param {IAlert} a
   * @param {IConfirm} c
   * @param {ILog} l
   */
  constructor(t, a, c, l){
    super();
    this.t = t;
    this.a = a;
    this.c = c;
    this.l = l;
  }

  toast(type, msg){ this.t.toast(type, msg); }
  alert(msg){ this.a.alert(msg); }
  confirm(q){ return this.c.confirm(q); }
  log(msg){ this.l.log(msg); }
}
