// src/dip/contracts.js
// Tutaj definiujemy ABSTRAKCJE (interfejsy) używane przez warstwę wysokopoziomową.
// DIP: moduły wysokopoziomowe (use-cases) znają tylko te kontrakty, a nie konkretne klasy.

/**
 * Abstrakcja repozytorium zadań.
 * Warstwa wysokopoziomowa nie wie, czy dane są w localStorage, HTTP, pamięci itd.
 */
export class ITaskRepository {
  /** Zwraca listę wszystkich zadań. */
  async listTasks() { throw new Error("ITaskRepository.listTasks not implemented"); }

  /**
   * Zapisuje całą listę zadań.
   * Można tu np. nadpisać całą tablicę w store lub wysłać ją na serwer.
   */
  async saveTasks(tasks) { throw new Error("ITaskRepository.saveTasks not implemented"); }
}

/**
 * Abstrakcja systemu powiadomień.
 * Np. toast, log, alert – ale warstwa wyższa nie musi tego wiedzieć.
 */
export class INotifier {
  /** Wyświetla powiadomienie danego typu. */
  notify(type, message) { throw new Error("INotifier.notify not implemented"); }
}

/**
 * Abstrakcja eksportera danych.
 * Może eksportować do CSV, JSON, PDF itd., ale kontrakt mówi tylko: „daj mi plik”.
 */
export class IExporter {
  /**
   * Przyjmuje listę zadań i zwraca opis pliku:
   * { mime: string, filename: string, data: string|Uint8Array }
   */
  export(tasks) { throw new Error("IExporter.export not implemented"); }
}
