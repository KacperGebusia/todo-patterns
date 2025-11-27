// src/good/BetterTodoManager.js
// Refaktoryzacja "BadTodoManager" zgodnie z zasadami:
// - SRP (Single Responsibility Principle)
// - krótsze metody
// - mniej argumentów (obiekt jako parametr)
// - lepsze nazwy i podział logiki na pomocnicze metody

export class BetterTodoManager {
  constructor({
    apiUrl,
    defaultUserName,
    debug = false,
    initialTasks = [],
    localStorageKey = "todos_data_react_kanban",
    containerId,
  }) {
    this.apiUrl = apiUrl;
    this.defaultUserName = defaultUserName;
    this.debug = debug;
    this.tasks = Array.isArray(initialTasks) ? [...initialTasks] : [];
    this.localStorageKey = localStorageKey;
    this.containerId = containerId;

    this.lastSyncTime = null;
    this.isLoading = false;
    this.error = null;
  }

  /** PUBLIC API ************************************************************/

  /**
   * Tworzy lub aktualizuje zadanie.
   * Zastępuje addOrUpdateTaskMaybe z dużą liczbą parametrów.
   */
  addOrUpdateTask(taskData, options = {}) {
    const { scrollIntoView = false, showToast = false, userName } = options;

    const normalized = this._normalizeTaskInput(taskData, userName);

    if (!this._isTitleValid(normalized.title)) {
      this._setError("Title is empty, cannot add or update task");
      return;
    }

    const existing = this._findTaskById(normalized.id);

    if (existing) {
      this._updateTask(existing, normalized);
    } else {
      this._createTask(normalized);
    }

    this._persistTasks();
    this._renderTasks(scrollIntoView);

    if (showToast) {
      this._showToast(`Task saved by ${normalized.userName}`);
    }

    this._debugLog("tasks after add/update", this.tasks);
  }

  /**
   * Synchronizuje listę zadań z serwerem.
   */
  async syncWithServer({ clearLocal = false, delayMs = 0, onDone } = {}) {
    this.isLoading = true;
    this.error = null;
    this._debugLog("starting sync", { delayMs });

    try {
      if (delayMs > 0) {
        await this._delay(delayMs);
      }

      const serverTasks = await this._postTasksToServer(this.tasks);
      if (Array.isArray(serverTasks)) {
        this.tasks = serverTasks;
      }

      this.lastSyncTime = new Date().toISOString();

      if (clearLocal) {
        this._clearLocalData();
      } else {
        this._persistTasks();
      }

      this._markContainerAsSynced();
      this._debugLog("sync success", {
        lastSyncTime: this.lastSyncTime,
        tasks: this.tasks,
      });

      if (typeof onDone === "function") {
        onDone(null, { tasks: this.tasks, lastSyncTime: this.lastSyncTime });
      }
    } catch (err) {
      this._setError(err);
      this._debugError("sync error", err);
      if (typeof onDone === "function") {
        onDone(err);
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Proste logowanie stanu – zamiast tajemniczej metody lg()
   */
  logState() {
    console.log(
      "[BetterTodoManager] state",
      {
        apiUrl: this.apiUrl,
        defaultUserName: this.defaultUserName,
        debug: this.debug,
        tasks: this.tasks,
        lastSyncTime: this.lastSyncTime,
        containerId: this.containerId,
        error: this.error,
      }
    );
  }

  /** PRIVATE helpers ********************************************************/

  _normalizeTaskInput(taskData, userNameOverride) {
    const now = new Date().toISOString();
    const userName = userNameOverride || this.defaultUserName;

    return {
      id: taskData.id || crypto.randomUUID(),
      title: String(taskData.title ?? "").trim(),
      description: taskData.description ?? "",
      status: taskData.status ?? "todo",
      priority: taskData.priority ?? 1,
      dueDate: taskData.dueDate ?? null,
      tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      userName,
      now,
    };
  }

  _isTitleValid(title) {
    return Boolean(title && title.trim().length > 0);
  }

  _findTaskById(id) {
    return this.tasks.find((t) => t.id === id) || null;
  }

  _updateTask(existing, normalized) {
    existing.title = normalized.title;
    existing.description = normalized.description;
    existing.status = normalized.status;
    existing.priority = normalized.priority;
    existing.dueDate = normalized.dueDate;
    existing.tags = normalized.tags;
    existing.updatedBy = normalized.userName;
    existing.updatedAt = normalized.now;
  }

  _createTask(normalized) {
    this.tasks.push({
      id: normalized.id,
      title: normalized.title,
      description: normalized.description,
      status: normalized.status,
      priority: normalized.priority,
      dueDate: normalized.dueDate,
      tags: normalized.tags,
      createdBy: normalized.userName,
      createdAt: normalized.now,
      updatedBy: normalized.userName,
      updatedAt: normalized.now,
    });
  }

  _persistTasks() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.tasks));
    } catch (e) {
      this._setError(e);
      this._debugError("localStorage error", e);
    }
  }

  _renderTasks(scrollIntoView) {
    const container = this._getContainer();
    if (!container) return;

    container.innerHTML = "";
    this.tasks.forEach((t) => {
      const div = document.createElement("div");
      div.className = "bad-task-item";
      div.innerText = `${t.title} [${t.status}] (P${t.priority})`;
      container.appendChild(div);
    });

    if (scrollIntoView && container.lastElementChild) {
      container.lastElementChild.scrollIntoView({ behavior: "smooth" });
    }
  }

  _showToast(message) {
    // w prawdziwej appce: emit do Mediatora / UI bus
    alert(message);
  }

  async _postTasksToServer(tasks) {
    const response = await fetch(this.apiUrl + "/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    });

    const data = await response.json();
    return data.tasks;
  }

  _clearLocalData() {
    this.tasks = [];
    localStorage.removeItem(this.localStorageKey);
  }

  _markContainerAsSynced() {
    const container = this._getContainer();
    if (!container) return;

    container.classList.add("synced");
    if (this.lastSyncTime) {
      container.dataset.syncedAt = this.lastSyncTime;
    }
  }

  _getContainer() {
    if (!this.containerId) return null;
    return document.getElementById(this.containerId);
  }

  _setError(err) {
    this.error = err;
  }

  _debugLog(message, payload) {
    if (!this.debug) return;
    console.log(`[BetterTodoManager] ${message}`, payload);
  }

  _debugError(message, err) {
    if (!this.debug) return;
    console.error(`[BetterTodoManager] ${message}`, err);
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
