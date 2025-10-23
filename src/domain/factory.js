// [PATTERN: Factory Method] — DEKLARACJA
// Produkty (Task + warianty) i wytwórnia TaskFactory.

import { Circle, Star, CalendarDays } from "lucide-react";

export class Task {
  constructor(p) {
    this.id = p.id ?? crypto.randomUUID();
    this.title = p.title ?? "Untitled";
    this.completed = Boolean(p.completed);
    this.meta = p.meta || {};
    this.type = p.type || "simple";
    this.createdAt = p.createdAt ?? Date.now();
    this.status = p.status ?? (this.completed ? "done" : "todo");
    this.order = typeof p.order === "number" ? p.order : 0;
  }
  toggle() { this.completed = !this.completed; }
  toJSON() {
    return { id: this.id, title: this.title, completed: this.completed, createdAt: this.createdAt, type: this.type, meta: this.meta, status: this.status, order: this.order };
  }
}
export class SimpleTask extends Task { constructor(p){ super({ ...p, type: "simple", meta: { icon: "circle", ...(p.meta||{}) } }) } }
export class PriorityTask extends Task { constructor(p){ super({ ...p, type: "priority", meta: { icon: "star", priority: p.meta?.priority ?? p.priority ?? 1 } }) } }
export class DeadlineTask extends Task { constructor(p){ super({ ...p, type: "deadline", meta: { icon: "calendar", due: p.meta?.due ?? p.due ?? new Date().toISOString() } }) } }
export class TaskFactory {
  static create(kind, props = {}) { switch (kind) { case "priority": return new PriorityTask(props); case "deadline": return new DeadlineTask(props); default: return new SimpleTask(props); } }
  static fromJSON(json) { return TaskFactory.create(json.type, json); }
}
export const Icons = { circle: Circle, star: Star, calendar: CalendarDays };