// src/builder/TaskBuilder.test.js
import { describe, it, expect, beforeAll } from "vitest";
import { TaskBuilder } from "./TaskBuilder";
import {
  SimpleTask,
  PriorityTask,
  DeadlineTask,
} from "../models/Task";

beforeAll(() => {
  if (!globalThis.crypto) {
    globalThis.crypto = {
      randomUUID: () => "test-id",
    };
  } else if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => "test-id";
  }
});

describe("TaskBuilder", () => {
  it("rzuca wyjątek gdy brak tytułu", () => {
    const builder = new TaskBuilder();

    expect(() => builder.build()).toThrow("Brak tytułu zadania.");
  });

  it("buduje SimpleTask jako domyślny typ", () => {
    const builder = new TaskBuilder();

    const task = builder
      .title("Proste zadanie")
      .build();

    expect(task).toBeInstanceOf(SimpleTask);
    expect(task.title).toBe("Proste zadanie");
    expect(task.type).toBe("simple");
    expect(task.meta.status).toBe("todo");
  });

  it("buduje PriorityTask gdy type='priority' i ustawia priority", () => {
    const builder = new TaskBuilder();

    const task = builder
      .title("Ważne")
      .type("priority")
      .priority(3)
      .status("in_progress")
      .build();

    expect(task).toBeInstanceOf(PriorityTask);
    expect(task.type).toBe("priority");
    expect(task.meta.priority).toBe(3);
    expect(task.meta.status).toBe("in_progress");
  });

  it("buduje DeadlineTask gdy type='deadline' i ustawia due", () => {
    const builder = new TaskBuilder();

    const task = builder
      .title("Z terminem")
      .type("deadline")
      .due("2035-12-24T10:00")
      .build();

    expect(task).toBeInstanceOf(DeadlineTask);
    expect(task.type).toBe("deadline");
    expect(typeof task.meta.due).toBe("string");
    expect(task.meta.status).toBe("todo");
  });

  it("resetuje stan po build – kolejne zadanie nie dziedziczy poprzednich meta", () => {
    const builder = new TaskBuilder();

    const first = builder
      .title("Pierwsze")
      .type("priority")
      .priority(5)
      .status("blocked")
      .build();

    const second = builder
      .title("Drugie")
      // bez ustawiania typu/prio/status
      .build();

    expect(first).toBeInstanceOf(PriorityTask);
    expect(first.meta.priority).toBe(5);
    expect(first.meta.status).toBe("blocked");

    expect(second).toBeInstanceOf(SimpleTask);
    // domyślny status z buildera
    expect(second.meta.status).toBe("todo");
    // nie powinno być odziedziczonego priority
    expect(second.meta.priority).toBeUndefined();
  });
});
