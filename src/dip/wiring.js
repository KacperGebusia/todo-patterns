import { todoStore } from "../store";
import { LocalStateTaskRepository, ToastNotifier, CsvExporter } from "./impls";
import { TaskUseCases } from "./usecases";

const repo = new LocalStateTaskRepository({
  getState: () => todoStore.state,
  setState: async (tasks) => { await todoStore.restoreSnapshot({ data: tasks }); }
});
const notifier = new ToastNotifier();
const exporter = new CsvExporter();

export const dipContainer = {
  repo, notifier, exporter,
  usecases: new TaskUseCases(repo, notifier, exporter),
};
