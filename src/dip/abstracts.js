// dip/abstracts.js

import {
  ITaskRepository,
  INotifier,
  IExporter,
} from "./contracts";

export class AbstractTaskRepository extends ITaskRepository {
  filter(tasks, predicate) {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.filter(predicate);
  }
}

export class AbstractNotifier extends INotifier {
  info(message) {
    this.notify("info", message);
  }

  success(message) {
    this.notify("success", message);
  }

  error(message) {
    this.notify("error", message);
  }
}

export class AbstractExporter extends IExporter {
  createDatedFilename(prefix, extension) {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-");
    return `${prefix}-${timestamp}.${extension}`;
  }
}
