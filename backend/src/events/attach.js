const events = require('events');
const { updateCashBackInMonth } = require('./purchases');

const eventEmitter = new events.EventEmitter();

const eventTypes = {
  UPDATED_PURCHASE: 'UPDATED_PURCHASE',
};

const init = () => {
  eventEmitter.on(eventTypes.UPDATED_PURCHASE, updateCashBackInMonth);
};

const trigger = (eventType, ...params) => {
  eventEmitter.emit(eventType, ...params);
};

module.exports = {
  init,
  trigger,
  eventTypes,
};
