import { todoStore } from "../store";
import { CommandBus } from "./CommandBus";

export const commandBus = new CommandBus(todoStore);

// re-eksport komend (dla wygody)
export * from "./commands";
