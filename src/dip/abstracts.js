import { ITaskRepository, INotifier, IExporter } from "./contracts";

export class AbstractTaskRepository extends ITaskRepository {
  filter(tasks, pred){ return Array.isArray(tasks) ? tasks.filter(pred) : []; }
}
export class AbstractNotifier extends INotifier {
  info(msg){ this.notify("info", msg); }
  success(msg){ this.notify("success", msg); }
  error(msg){ this.notify("error", msg); }
}
export class AbstractExporter extends IExporter {
  fileWithDate(prefix, ext){
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    return `${prefix}-${ts}.${ext}`;
  }
}
