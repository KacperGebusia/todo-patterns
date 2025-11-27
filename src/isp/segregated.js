// src/isp/segregated.js

// Zad 3.2 Zasada segregacji interfejsów
// podział grubych interfejsów na małe

// Tutaj stosujemy Interface Segregation Principle.
// Zamiast 3 "grubych" interfejsów z fat.js dzielimy je na małe, spójne kontrakty.

/* ===================== */
/*  Repozytorium zadań   */
/* ===================== */

/** Tylko odczyt zadań. */
export class ITaskReader {
  async list() {
    throw new Error("ITaskReader.list not implemented");
  }
}

/** Tylko zapis pełnej listy zadań. */
export class ITaskWriter {
  async save(tasks) {
    throw new Error("ITaskWriter.save not implemented");
  }
}

/** Tylko tworzenie nowych zadań. */
export class ITaskCreator {
  async create(task) {
    throw new Error("ITaskCreator.create not implemented");
  }
}

/** Tylko aktualizacja istniejących zadań. */
export class ITaskUpdater {
  async update(id, patch) {
    throw new Error("ITaskUpdater.update not implemented");
  }
}

/** Tylko usuwanie zadań. */
export class ITaskRemover {
  async remove(id) {
    throw new Error("ITaskRemover.remove not implemented");
  }
}

/** Tylko przenoszenie kart między kolumnami. */
export class ITaskMover {
  async move(id, toStatus, toIndex) {
    throw new Error("ITaskMover.move not implemented");
  }
}

/** Tylko operacje masowe – hurtowe zamykanie zadań. */
export class ITaskBulkCloser {
  async bulkClose(status) {
    throw new Error("ITaskBulkCloser.bulkClose not implemented");
  }
}

/* ===================== */
/*       Eksport         */
/* ===================== */

/** Eksportowalność do CSV. */
export class IExportCSV {
  exportCSV(tasks) {
    throw new Error("IExportCSV.exportCSV not implemented");
  }
}

/** Eksportowalność do JSON. */
export class IExportJSON {
  exportJSON(tasks) {
    throw new Error("IExportJSON.exportJSON not implemented");
  }
}

/** Eksportowalność do ICS (kalendarz). */
export class IExportICS {
  exportICS(tasks) {
    throw new Error("IExportICS.exportICS not implemented");
  }
}

/* ===================== */
/*     Powiadomienia     */
/* ===================== */

/** Pokazywanie toastów (notyfikacje nieblokujące). */
export class IToast {
  toast(type, message) {
    throw new Error("IToast.toast not implemented");
  }
}

/** Pokazywanie alertów (blokujące). */
export class IAlert {
  alert(message) {
    throw new Error("IAlert.alert not implemented");
  }
}

/** Potwierdzanie akcji (confirm). */
export class IConfirm {
  confirm(question) {
    throw new Error("IConfirm.confirm not implemented");
  }
}

/** Logowanie (np. do konsoli). */
export class ILog {
  log(message) {
    throw new Error("ILog.log not implemented");
  }
}
