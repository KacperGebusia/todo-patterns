// src/dip/wiring.js
// Składanie zależności (kompozycja) – tutaj łączymy konkrety z abstrakcjami.
// To jest "krawędź" aplikacji: tylko tu wiemy, że używamy todoStore, ToastNotifier i CsvExporter.

import { todoStore } from "../store";
import { LocalStateTaskRepository, ToastNotifier, CsvExporter } from "./impls";
import { TaskUseCases } from "./usecases";

// Tworzymy repozytorium oparte o store.
// Implementacja używa funkcji getState i setState, dzięki czemu jest wymienialna.
const repo = new LocalStateTaskRepository({
  getState: () => todoStore.state,
  // Zapis realizujemy przez mechanizm Memento/Store.
  setState: async (tasks) => { await todoStore.restoreSnapshot({ data: tasks }); }
});

// Konkretny notifier – toasty przez Mediatora.
const notifier = new ToastNotifier();

// Konkretny eksporter – CSV.
const exporter = new CsvExporter();

// Warstwa wysokopoziomowa – use-cases dostają tylko abstrakcje.
export const dipContainer = {
  repo,
  notifier,
  exporter,
  usecases: new TaskUseCases(repo, notifier, exporter),
};
