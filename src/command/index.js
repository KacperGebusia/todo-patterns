// src/command/index.js
// Punkt wejścia dla modułu Command: CommandBus + wszystkie komendy.

import { todoStore } from "../store";
import { CommandBus } from "./CommandBus";

export const commandBus = new CommandBus(todoStore);

// Re-eksport komend (dla wygody importu w UI)
export * from "./commands";
