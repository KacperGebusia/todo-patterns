// dip/usecases.js

import {
  ITaskRepository,
  INotifier,
  IExporter,
} from "./contracts";

export class TaskUseCases {
  /**
   * @param {ITaskRepository} taskRepository
   * @param {INotifier} notifier
   * @param {IExporter} exporter
   */
  constructor(taskRepository, notifier, exporter) {
    this.taskRepository = taskRepository;
    this.notifier = notifier;
    this.exporter = exporter;
  }

  async completeAllInStatus(status) {
    const tasks = await this.taskRepository.listTasks();
    const closedTasks = this.markTasksAsDoneInStatus(
      tasks,
      status
    );

    await this.taskRepository.saveTasks(closedTasks);
    this.notifyAllClosed(status);
  }

  async exportDone() {
    const tasks = await this.taskRepository.listTasks();
    const doneTasks = this.filterDoneTasks(tasks);

    const file = this.exporter.export(doneTasks);
    this.notifyExport(doneTasks.length, file.filename);

    return file;
  }

  // ---------- helpers (pojedyncza odpowiedzialność) ----------

  markTasksAsDoneInStatus(tasks, status) {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.map((task) =>
      task.status === status
        ? { ...task, status: "done", completed: true }
        : task
    );
  }

  filterDoneTasks(tasks) {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.filter(
      (task) => task.status === "done" || task.completed
    );
  }

  notifyAllClosed(status) {
    this.notifier.success(
      `Zamknięto wszystkie karty w kolumnie ${status}.`
    );
  }

  notifyExport(doneCount, filename) {
    this.notifier.info(
      `Wyeksportowano ${doneCount} kart do pliku ${filename}.`
    );
  }
}
