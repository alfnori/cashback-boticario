const events = require('events');
const { updateCashBackInMonth } = require('./purchases');

const eventEmitter = new events.EventEmitter();

/**
 * @readonly
 * @enum
 */
const eventTypes = {
  UPDATED_PURCHASE: 'UPDATED_PURCHASE',
};

/**
 * Initializes event emitters listeners
 */
const init = () => {
  eventEmitter.on(eventTypes.UPDATED_PURCHASE, updateCashBackInMonth);
};

/**
 * Triggers an event with params
 * @param {String} eventType The name of the event
 * @param  {...any} params The params to be sent to event
 */
const trigger = (eventType, ...params) => {
  eventEmitter.emit(eventType, ...params);
};

module.exports = {
  init,
  trigger,
  eventTypes,
};
