// dip/contracts.js

// Zad 2.1 Zasada odwrócenia zależności
// Abstrakcyjne interfejsy

// Kontrakty wysokiego poziomu dla DIP:
// - ITaskRepository: dostęp do zadań
// - INotifier: powiadomienia
// - IExporter: eksport zadań

export class ITaskRepository {
  async listTasks() {
    throw new Error(
      "ITaskRepository.listTasks not implemented"
    );
  }

  async saveTasks(tasks) {
    throw new Error(
      "ITaskRepository.saveTasks not implemented"
    );
  }
}

export class INotifier {
  notify(type, message) {
    throw new Error(
      "INotifier.notify not implemented"
    );
  }
}

export class IExporter {
  export(tasks) {
    throw new Error(
      "IExporter.export not implemented"
    );
  }
}
