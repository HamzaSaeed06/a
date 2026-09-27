const logger = require("../config/logger");

const listeners = new Map();

const on = (event, callback) => {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(callback);
  return () => {
    const set = listeners.get(event);
    if (set) set.delete(callback);
  };
};

const emit = (event, data) => {
  const set = listeners.get(event);
  if (!set) return;
  for (const cb of set) {
    try {
      cb(data);
    } catch (err) {
      logger.error(`Error in WS emitter listener for "${event}":`, err);
    }
  }
};

module.exports = { on, emit };
