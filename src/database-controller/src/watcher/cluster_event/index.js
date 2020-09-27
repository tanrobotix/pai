// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

require('module-alias/register');
require('dotenv').config();
const fetch = require('node-fetch');
const AsyncLock = require('async-lock');
const { default: PQueue } = require('p-queue');
const logger = require('@dbc/common/logger');
const { getEventInformer } = require('@dbc/common/k8s');
const { alwaysRetryDecorator } = require('@dbc/common/util');
const config = require('@dbc/watcher/framework/config');

// Here, we use AsyncLock to control the concurrency of events with the same uid;
// e.g. If one event has ADDED, MODIFED, and MODIFED incidents, we use AsyncLock
// to ensure they will be delivered to write-merger in order.
// In the same time, we use PQueue to control the concurrency of events with different uid;
// e.g. If there are event 1 ~ event 30000, only some of them can be processed concurrently.
const lock = new AsyncLock({ maxPending: Number.MAX_SAFE_INTEGER });
const queue = new PQueue({ concurrency: config.maxRpcConcurrency });
const databaseModel = new DatabaseModel(
  config.dbConnectionStr,
  config.maxDatabaseConnection,
);

async function synchronizeEvent(eventType, apiObject) {
  // query db instead
  const uid = apiObject.metadata.uid;
  const type = apiObject.type;
  const podUid = apiObject.involvedObject.uid
  const names = apiObject.involvedObject.name.split('-')
  const frameworkName = names[0]
  const taskroleName = names[1]
  const taskIndex = parseInt(names[2])

  const message = apiObject.message
}

const eventHandler = (eventType, apiObject) => {
  /*
    framework name-based lock + always retry
  */
  const receivedTs = new Date().getTime();
  const involvedObjKind = apiObject.involvedObject.kind;
  const involvedObjName = apiObject.involvedObject.name;
  const uid = apiObject.metadata.uid;
  if (involvedObjKind === 'Pod' && /^[a-z0-9]{32}-[A-Za-z0-9._~]+-[0-9]+$/.test(involvedObjName)) {
    logger.info(
      `Cluster event type=${eventType} receivedTs=${receivedTs} uid=${uid} involvedObjKind=${involvedObjKind} involvedObjName=${involvedObjName} received.`,
    );
    lock.acquire(uid, () => {
      return queue.add(
        alwaysRetryDecorator(
          () => synchronizeEvent(eventType, apiObject),
          `Sync to database type=${eventType} receivedTs=${receivedTs} uid=${uid} involvedObjKind=${involvedObjKind} involvedObjName=${involvedObjName}`,
        ),
      );
    });
  } else {
    logger.info(
      `Cluster Event type=${eventType} receivedTs=${receivedTs} uid=${uid} involvedObjKind=${involvedObjKind} involvedObjName=${involvedObjName} received but ignored.`,
    );
  }

};

const informer = getEventInformer();

informer.on('add', apiObject => {
  eventHandler('ADDED', apiObject);
});
informer.on('update', apiObject => {
  eventHandler('MODIFED', apiObject);
});
informer.on('delete', apiObject => {
  // we ignore event deletion since they are not important to us
  logger.info(`Event ${apiObject.metadata.uid} is ignored`);
});
informer.on('error', err => {
  // If any error happens, the process should exit, and let Kubernetes restart it.
  logger.error(err, function() {
    process.exit(1);
  });
});
informer.start();
