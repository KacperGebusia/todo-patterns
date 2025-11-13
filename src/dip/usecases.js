import { ITaskRepository, INotifier, IExporter } from "./contracts";

export class TaskUseCases {
  constructor(repo, notifier, exporter){
    this.repo = repo;
    this.notifier = notifier;
    this.exporter = exporter;
  }

  async completeAllInStatus(status){
    const tasks = await this.repo.listTasks();
    const next = tasks.map(t => t.status === status ? ({ ...t, status: "done", completed: true }) : t);
    await this.repo.saveTasks(next);
    this.notifier.success(`Zamknięto wszystkie karty w kolumnie ${status}.`);
  }

  async exportDone(){
    const tasks = await this.repo.listTasks();
    const done = tasks.filter(t => t.status === "done" || t.completed);
    const file = this.exporter.export(done);
    this.notifier.info(`Wyeksportowano ${done.length} kart do pliku ${file.filename}.`);
    return file;
  }
}
