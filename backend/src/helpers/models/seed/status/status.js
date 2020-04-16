/* eslint-disable no-underscore-dangle */
const Status = require('../../../../models/status');
const { logError, logDatabase } = require('../../../../utils/logger');
const defaultData = require('./status.json');

const requiredTags = defaultData.map((s) => s.tag);


const assertTag = async (tag) => {
  try {
    const dbStatus = await Status.find({ tag });
    if (!dbStatus || dbStatus.length !== 1 || !dbStatus[0]._id) {
      const newStatus = defaultData.find((d) => d.tag === tag);
      await Status.create(newStatus);
      logDatabase(`Status ${tag} has been created!`);
    } else {
      logDatabase(`Status ${tag} already exists!`);
    }
  } catch (error) {
    logError(error);
  }
};

const assertStatus = async (assertTags) => {
  logDatabase('Seeding Status');
  await Promise.all(assertTags.map(async (tag) => {
    await assertTag(tag);
  }));
  logDatabase('Seed finished!');
};

module.exports = async () => {
  await assertStatus(requiredTags);
};
