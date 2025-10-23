// Prosty iterator ze stronicowaniem.
// Użycie:
// const it = new TaskIterator(items, { pageSize: 20 });
// const { items: page, pageCount } = it.getPage(1);

export class TaskIterator {
  constructor(items = [], { pageSize = 20 } = {}) {
    this.setItems(items);
    this.pageSize = Math.max(1, Number(pageSize) || 20);
  }
  setItems(items) {
    this.items = Array.isArray(items) ? items : [];
    this.count = this.items.length;
    this.pageCount = Math.max(1, Math.ceil(this.count / this.pageSize || 1));
  }
  getPage(pageNumber = 1) {
    const p = Math.min(Math.max(1, Number(pageNumber) || 1), this.pageCount);
    const start = (p - 1) * this.pageSize;
    const end = start + this.pageSize;
    return {
      items: this.items.slice(start, end),
      page: p,
      pageCount: this.pageCount,
      total: this.count,
      pageSize: this.pageSize,
    };
  }
}
