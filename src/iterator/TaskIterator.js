// src/iterator/TaskIterator.js
// Prosty iterator ze stronicowaniem.
// Użycie:
// const iterator = new TaskIterator(items, { pageSize: 20 });
// const { items: page, pageCount } = iterator.getPage(1);

export class TaskIterator {
  constructor(items = [], { pageSize = 20 } = {}) {
    this.pageSize = this.normalizePageSize(pageSize);
    this.setItems(items);
  }

  setItems(items) {
    this.items = Array.isArray(items) ? items : [];
    this.totalCount = this.items.length;
    this.pageCount = this.computePageCount(
      this.totalCount,
      this.pageSize
    );
  }

  getPage(pageNumber = 1) {
    const normalizedPage =
      this.normalizePageNumber(pageNumber);
    const startIndex =
      (normalizedPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return {
      items: this.items.slice(startIndex, endIndex),
      page: normalizedPage,
      pageCount: this.pageCount,
      total: this.totalCount,
      pageSize: this.pageSize,
    };
  }

  // =====================
  // UTILS
  // =====================

  normalizePageSize(rawPageSize) {
    const numeric = Number(rawPageSize) || 20;
    return Math.max(1, numeric);
  }

  computePageCount(totalCount, pageSize) {
    if (!totalCount) return 1;
    const pages = Math.ceil(totalCount / pageSize);
    return Math.max(1, pages);
  }

  normalizePageNumber(rawPageNumber) {
    const numeric =
      Number(rawPageNumber) || 1;
    const clamped = Math.min(
      Math.max(1, numeric),
      this.pageCount
    );
    return clamped;
  }
}
