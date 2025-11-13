// dip/wiring.js

// Zad 2.5 Zasada odwrócenia zależności
// składanie zależności


import { todoStore } from "../store";
import {
  LocalStateTaskRepository,
  ToastNotifier,
  CsvExporter,
} from "./impls";
import { TaskUseCases } from "./usecases";

function createLocalStateRepository() {
  return new LocalStateTaskRepository({
    getState: () => todoStore.state,
    setState: async (tasks) => {
      await todoStore.restoreSnapshot({ data: tasks });
    },
  });
}

function createNotifier() {
  return new ToastNotifier();
}

function createExporter() {
  return new CsvExporter();
}

function createUseCases(repository, notifier, exporter) {
  return new TaskUseCases(repository, notifier, exporter);
}

const repository = createLocalStateRepository();
const notifier = createNotifier();
const exporter = createExporter();

export const dipContainer = {
  repo: repository,
  notifier,
  exporter,
  usecases: createUseCases(repository, notifier, exporter),
};
