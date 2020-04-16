
const moment = require('moment');
const { sanitizerEscape } = require('../../utils/transformer');

const mongooseRegex = (str) => ({ $regex: new RegExp(sanitizerEscape(str)), $options: 'ig' });
const mongooseDatex = (date, startDate = null, endDate = null) => {
  const startDefault = new Date(1900, 0, 1, 0, 0, 0, 0);
  const endDefault = new Date(2900, 0, 1, 0, 0, 0, 0);
  let start = startDefault;
  let end = endDefault;
  try {
    if (startDate && endDate) {
      const mStart = moment(startDate);
      const mEnd = moment(endDate);
      if (mStart.isValid() && mEnd.isValid()) {
        start = mStart.toDate();
        end = mEnd.toDate();
      }
    } else {
      const mDate = moment(date);
      if (mDate.isValid()) {
        start = mDate.clone().startOf('day').toDate();
        end = mDate.clone().endOf('day').toDate();
      }
    }
  } catch (err) {
    start = null;
    end = null;
  }
  if ((start === null || end === null)) {
    start = startDefault;
    end = endDefault;
  }
  return ({ $gte: start, $lt: end });
};

module.exports = {
  mongooseRegex,
  mongooseDatex,
};
