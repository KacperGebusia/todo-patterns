// src/dip/usecases.js
// WARSTWA WYSOKOPOZIOMOWA – przypadki użycia oparte wyłącznie na abstrakcjach.
// DIP: nie importujemy tutaj żadnych konkretów, tylko interfejsy z contracts.js.

import { ITaskRepository, INotifier, IExporter } from "./contracts";

/**
 * TaskUseCases – logika aplikacyjna oparta o DIP.
 * Repozytorium, Notifier i Exporter są wstrzykiwane z zewnątrz.
 */
export class TaskUseCases {
  /**
   * @param {ITaskRepository} repo
   * @param {INotifier} notifier
   * @param {IExporter} exporter
   */
  constructor(repo, notifier, exporter){
    // Wszystkie pola są typu ABSTRAKCJI, a nie konkretnych klas.
    this.repo = repo;
    this.notifier = notifier;
    this.exporter = exporter;
  }

  /**
   * Przypadek użycia: zamknij wszystkie zadania o danym statusie.
   * 1) Pobiera listę zadań z repozytorium
   * 2) Aktualizuje status na "done"
   * 3) Zapisuje całą listę
   * 4) Wysyła powiadomienie
   */
  async completeAllInStatus(status){
    const tasks = await this.repo.listTasks();
    const next = tasks.map(t =>
      t.status === status
        ? ({ ...t, status: "done", completed: true })
        : t
    );
    await this.repo.saveTasks(next);
    this.notifier.success(`Zamknięto wszystkie karty w kolumnie ${status}.`);
  }

  /**
   * Przypadek użycia: eksport wszystkich zadań zakończonych do pliku.
   * Format pliku zależy od konkretnego eksportera (tutaj CSV).
   */
  async exportDone(){
    const tasks = await this.repo.listTasks();
    const done = tasks.filter(t => t.status === "done" || t.completed);
    const file = this.exporter.export(done);
    this.notifier.info(`Wyeksportowano ${done.length} kart do pliku ${file.filename}.`);
    return file;
  }
}
