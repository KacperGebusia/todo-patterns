// src/models/Task.test.js
import { describe, it, expect, beforeAll } from "vitest";
import {
  Task,
  SimpleTask,
  PriorityTask,
  DeadlineTask,
} from "./Task";

// Na wszelki wypadek – stub crypto.randomUUID w środowisku testowym
beforeAll(() => {
  if (!globalThis.crypto) {
    globalThis.crypto = {
      randomUUID: () => "test-id",
    };
  } else if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => "test-id";
  }
});

/**
 * TESTY DLA KLASY Task
 */
describe("Task (base class)", () => {
  it("tworzy zadanie z domyślnymi wartościami", () => {
    const task = new Task({ title: "Test" });

    expect(task.title).toBe("Test");
    expect(task.completed).toBe(false);
    expect(task.type).toBe("simple");
    expect(task.status).toBe("todo");
    expect(task.meta).toEqual({});
    expect(task.id).toBeDefined();
  });

  it("ustawia status na 'done' gdy completed = true i brak statusu", () => {
    const task = new Task({ title: "Done", completed: true });

    expect(task.completed).toBe(true);
    expect(task.status).toBe("done");
  });

  it("zwraca poprawny opis z getDescription() dla nieukończonego zadania", () => {
    const task = new Task({ title: "Opis" });

    expect(task.getDescription()).toBe("Task: Opis");
  });

  it("zwraca poprawny opis z getDescription() dla ukończonego zadania", () => {
    const task = new Task({ title: "Opis" });
    task.completed = true;

    expect(task.getDescription()).toBe("Task: Opis [done]");
  });

  it("rzuca wyjątek gdy tytuł jest pusty lub nieprawidłowy", () => {
    expect(() => new Task({ title: "" })).toThrow();
    // @ts-ignore – celowo zły typ
    expect(() => new Task({ title: 123 })).toThrow();
  });
});

/**
 * TESTY DLA KLASY PriorityTask
 */
describe("PriorityTask", () => {
  it("ustawia type='priority' oraz meta.icon='star'", () => {
    const task = new PriorityTask({ title: "Priorytet" });

    expect(task.type).toBe("priority");
    expect(task.meta.icon).toBe("star");
  });

  it("przyjmuje priorytet z props.priority", () => {
    const task = new PriorityTask({ title: "P", priority: 3 });

    expect(task.meta.priority).toBe(3);
  });

  it("priorytet z meta.priority ma pierwszeństwo nad priority", () => {
    const task = new PriorityTask({
      title: "P",
      priority: 1,
      meta: { priority: 5 },
    });

    expect(task.meta.priority).toBe(5);
  });

  it("domyślny priorytet to 1, jeśli nie podano", () => {
    const task = new PriorityTask({ title: "Domyślny" });

    expect(task.meta.priority).toBe(1);
  });

  it("getDescription zawiera priorytet i znacznik [done] jeśli ukończone", () => {
    const task = new PriorityTask({
      title: "Opis P",
      priority: 2,
      completed: true,
    });

    expect(task.getDescription()).toBe("Priority 2 – Opis P [done]");
  });
});

/**
 * TESTY DLA KLASY DeadlineTask
 */
describe("DeadlineTask", () => {
  it("ustawia type='deadline' oraz meta.icon='calendar'", () => {
    const task = new DeadlineTask({ title: "Termin" });

    expect(task.type).toBe("deadline");
    expect(task.meta.icon).toBe("calendar");
  });

  it("używa due z meta.due jeśli jest podany", () => {
    const task = new DeadlineTask({
      title: "T",
      meta: { due: "2030-01-01T00:00:00.000Z" },
    });

    expect(task.meta.due).toBe("2030-01-01T00:00:00.000Z");
  });

  it("używa due z props.due gdy meta.due brak", () => {
    const task = new DeadlineTask({
      title: "T",
      due: "2031-01-01T00:00:00.000Z",
    });

    expect(task.meta.due).toBe("2031-01-01T00:00:00.000Z");
  });

  it("gdy nie ma due – tworzy jakąś wartość (ISO string)", () => {
    const task = new DeadlineTask({ title: "T" });

    expect(typeof task.meta.due).toBe("string");
    expect(() => new Date(task.meta.due).toISOString()).not.toThrow();
  });

  it("getDescription dodaje informacje o due", () => {
    const task = new DeadlineTask({
      title: "T",
      due: "2040-01-01T00:00:00.000Z",
    });

    expect(task.getDescription()).toBe(
      "Task: T (due: 2040-01-01T00:00:00.000Z)"
    );
  });
});
