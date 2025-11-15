// src/iterator/TaskIterator.js
// [PATTERN: Iterator] — iterowanie po wynikach z obsługą stronicowania

export class TaskIterator {
  constructor(items = [], { pageSize = 20 } = {}) {
    this.pageSize = this.normalizePageSize(pageSize);
    this.setItems(items);
  }

  normalizePageSize(size) {
    const numeric = Number(size);
    return Math.max(1, numeric || 20);
  }

  normalizeItems(items) {
    return Array.isArray(items) ? items : [];
  }

  calculatePageCount(itemCount) {
    return Math.max(1, Math.ceil(itemCount / this.pageSize));
  }

  clampPageNumber(pageNumber) {
    const n = Number(pageNumber) || 1;
    return Math.min(Math.max(1, n), this.pageCount);
  }

  setItems(items) {
    this.allItems = this.normalizeItems(items);
    this.totalItems = this.allItems.length;
    this.pageCount = this.calculatePageCount(this.totalItems);
  }

  getPage(pageNumber = 1) {
    const pageIndex = this.clampPageNumber(pageNumber);
    const startIndex = (pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return {
      items: this.allItems.slice(startIndex, endIndex),
      page: pageIndex,
      pageCount: this.pageCount,
      total: this.totalItems,
      pageSize: this.pageSize,
    };
  }
}
