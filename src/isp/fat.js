// src/isp/fat.js
// Anty-przykład ISP – 3 "grube" interfejsy, które mają za dużo odpowiedzialności.
// Później pokażemy ich rozbicie na mniejsze kontrakty w segregated.js.

/**
 * "Grube" repozytorium / serwis zadań.
 * Łączy w sobie odczyt, zapis, tworzenie, modyfikację, usuwanie, ruch kart i operacje masowe.
 * Każda klasa, która implementuje ten interfejs, MUSI zaimplementować wszystko,
 * nawet jeśli potrzebuje tylko jednego z tych zachowań → łamanie ISP.
 */
export class ITaskServiceFat {
  /** Zwraca listę zadań. */
  async list() {
    throw new Error("ITaskServiceFat.list not implemented");
  }

  /** Zapisuje całą listę zadań. */
  async save(tasks) {
    throw new Error("ITaskServiceFat.save not implemented");
  }

  /** Tworzy nowe zadanie. */
  async create(task) {
    throw new Error("ITaskServiceFat.create not implemented");
  }

  /** Aktualizuje zadanie po id (patch obiektowy lub funkcja). */
  async update(id, patch) {
    throw new Error("ITaskServiceFat.update not implemented");
  }

  /** Usuwa zadanie po id. */
  async remove(id) {
    throw new Error("ITaskServiceFat.remove not implemented");
  }

  /** Przenosi kartę do innego statusu i pozycji. */
  async move(id, toStatus, toIndex) {
    throw new Error("ITaskServiceFat.move not implemented");
  }

  /** Zamyka hurtowo wszystkie zadania w danym statusie. */
  async bulkClose(status) {
    throw new Error("ITaskServiceFat.bulkClose not implemented");
  }
}

/**
 * "Gruby" serwis eksportu – jeden interfejs narzuca obsługę wielu formatów.
 */
export class IExportServiceFat {
  /** Eksport do CSV. */
  exportCSV(tasks) {
    throw new Error("IExportServiceFat.exportCSV not implemented");
  }

  /** Eksport do JSON. */
  exportJSON(tasks) {
    throw new Error("IExportServiceFat.exportJSON not implemented");
  }

  /** Eksport do formatu kalendarza (ICS). */
  exportICS(tasks) {
    throw new Error("IExportServiceFat.exportICS not implemented");
  }
}

/**
 * "Gruby" serwis powiadomień – łączy toast, alert, confirm i logi naraz.
 */
export class INotifyServiceFat {
  /** Pokazuje toast. */
  toast(type, message) {
    throw new Error("INotifyServiceFat.toast not implemented");
  }

  /** Pokazuje okno alert. */
  alert(message) {
    throw new Error("INotifyServiceFat.alert not implemented");
  }

  /** Pytanie typu confirm (tak/nie). */
  confirm(question) {
    throw new Error("INotifyServiceFat.confirm not implemented");
  }

  /** Zapisuje log. */
  log(message) {
    throw new Error("INotifyServiceFat.log not implemented");
  }
}
