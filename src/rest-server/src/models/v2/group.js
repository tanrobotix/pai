// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

// module dependencies
const crudUtil = require('@pai/utils/manager/group/crudUtil');
const authConfig = require('@pai/config/authn');
const secretConfig = require('@pai/config/secret');
const adapter = require('@pai/utils/manager/group/adapter/externalUtil');
const config = require('@pai/config/index');
const userModel = require('@pai/models/v2/user');
const logger = require('@pai/config/logger');
const vcModel = require('@pai/models/vc');
const basicConfig= require('@pai/config/index');

const crudType = basicConfig.userStorageType;
const crudGroup = crudUtil.getStorageObject(crudType);
let option = {
  'groupPrefix': process.env.GROUP_STORAGE_PREFIX,
};
logger.info(`Group storage type is ${crudType}`);
const crudConfig = crudGroup.initConfig(basicConfig.userStorageAddr, option);

let externalName2Groupname = {};

const getGroup = async (groupname) => {
  try {
    return await crudGroup.read(groupname, crudConfig);
  } catch (error) {
    throw error;
  }
};

const getAllGroup = async () => {
  try {
    return await crudGroup.readAll(crudConfig);
  } catch (error) {
    throw error;
  }
};

const getUserGrouplistFromExternal = async (username, data = {}) => {
  try {
    const adapterType = authConfig.groupConfig.groupDataSource;
    const groupAdapter = adapter.getStorageObject(adapterType);
    let response = [];
    let config = {};
    if (adapterType === 'winbind') {
      config = groupAdapter.initConfig(authConfig.groupConfig.winbindServerUrl);
    } else if (adapterType === 'ms-graph') {
      config = groupAdapter.initConfig(data.graphUrl, data.accessToken);
    }
    const externalGrouplist = await groupAdapter.getUserGroupList(username, config);
    for (const externalGroupname of externalGrouplist) {
      if (externalGroupname in externalName2Groupname) {
        response.push(externalName2Groupname[externalGroupname]);
      }
    }
    response = [...new Set(response)];
    return response;
  } catch (error) {
    throw error;
  }
};

const deleteGroup = async (groupname) => {
  try {
    const ret = await crudGroup.remove(groupname, crudConfig);
    logger.info('Init user list to update.');
    let userList = await userModel.getAllUser();
    let updateUserList = [];
    for (let userItem of userList) {
      if (userItem['grouplist'].includes(groupname)) {
        userItem['grouplist'].splice(userItem['grouplist'].indexOf(groupname), 1);
        if (userItem['extension']['virtualCluster'] && userItem['extension']['virtualCluster'].includes(groupname)) {
          userItem['extension']['virtualCluster'].splice(userItem['extension']['virtualCluster'].indexOf(groupname), 1);
        }
        updateUserList.push(userItem);
      }
    }
    if (updateUserList.length !== 0) {
      logger.info('User list to be updated has been prepared.');
      logger.info('Begin to update user\' group list.');
      await Promise.all(updateUserList.map(async (userData) => {
        await userModel.updateUser(userData['username'], userData);
      }));
      logger.info('Update group info successfully.');
    } else {
      logger.info('No user\' grouplist need to be updated.');
    }
    return ret;
  } catch (error) {
    throw error;
  }
};

const addGroupIntoAdminUser = async (groupname, groupValue) => {
  try {
    let userList = await userModel.getAllUser();
    let updateUserList = [];
    for (let userItem of userList) {
      if (!userItem['grouplist'].includes(authConfig.groupConfig.adminGroup.groupname)) {
        continue;
      }
      if (!userItem['grouplist'].includes(groupname)) {
        userItem['grouplist'].push(groupname);
        if (groupValue['extension']['groupType'] === 'vc' && !userItem['extension']['virtualCluster'].includes(groupname)) {
          userItem['extension']['virtualCluster'].push(groupname);
        }
        updateUserList.push(userItem);
      }
    }
    if (updateUserList.length !== 0) {
      logger.info('User list to be updated has been prepared.');
      logger.info('Begin to update user\' group list.');
      await Promise.all(updateUserList.map(async (userData) => {
        await userModel.updateUser(userData['username'], userData);
      }));
      logger.info('Update group info successfully.');
    } else {
      logger.info('No user\' grouplist need to be updated.');
    }
  } catch (error) {
    throw error;
  }
};

const createGroup = async (groupname, groupValue) => {
  try {
    const ret = await crudGroup.create(groupname, groupValue, crudConfig);
    await addGroupIntoAdminUser(groupname, groupValue);
    return ret;
  } catch (error) {
    throw error;
  }
};

const updateGroup = async (groupname, groupValue) => {
  try {
    return await crudGroup.update(groupname, groupValue, crudConfig);
  } catch (error) {
    throw error;
  }
};

const createGroupIfNonExistent = async (groupname, groupValue) => {
  try {
    await getGroup(groupname);
  } catch (error) {
    if (error.status === 404) {
      await createGroup(groupname, groupValue);
    } else {
      throw error;
    }
  }
};

const updateExternalName2Groupname = async () => {
  try {
    const groupList = await getAllGroup();
    externalName2Groupname.clear();
    for (const groupItem of groupList) {
      externalName2Groupname[groupItem.externalName] = groupItem.groupname;
    }
  } catch (error) {
    throw error;
  }
};

const virtualCluster2GroupList = async (virtualCluster) => {
  const groupList = virtualCluster.slice(0);
  return groupList;
};

const getAllGroupTypeObject = async () => {
  try {
    let groupInfoList = await getAllGroup();
    let groupType = {};
    for (const groupItem of groupInfoList) {
      const name = groupItem['groupname'];
      const type = groupItem['extension']['groupType'] ? groupItem['extension']['groupType'] : 'vc';
      if (name === authConfig.groupConfig.adminGroup.groupname) {
        groupType[name] = 'admin';
      } else {
        groupType[name] = type;
      }
    }
    return groupType;
  } catch (error) {
    throw error;
  }
};

const updateGrouplistWithVirtualCluster = async (grouplist, virtualCluster) => {
  try {
    let retVirtualCluster = [];
    let retGrouplist = [];
    const groupType = getAllGroupTypeObject();
    const admin = grouplist.includes(authConfig.groupConfig.adminGroup.groupname);
    if (admin) {
      for (let [key, value] of Object.entries(groupType)) {
        retGrouplist.push(key);
        if (value === 'vc') {
          retVirtualCluster.push(key);
        }
      }
    } else {
      retVirtualCluster = virtualCluster.slice(0);
      retGrouplist = virtualCluster.slice(0);
      for (const groupName in grouplist) {
        if (groupType[groupName] !== 'vc') {
          retGrouplist.push(groupName);
        }
      }
    }
    return {
      virtualCluster: retVirtualCluster,
      grouplist: retGrouplist,
    };
  } catch (error) {
    throw error;
  }
};

const updateVirtualClusterWithGrouplist = async (grouplist) => {
  try {
    let retVirtualCluster = [];
    let retGrouplist = [];
    const groupType = getAllGroupTypeObject();
    const admin = grouplist.includes(authConfig.groupConfig.adminGroup.groupname);
    if (admin) {
      for (let [key, value] of Object.entries(groupType)) {
        retGrouplist.push(key);
        if (value === 'vc') {
          retVirtualCluster.push(key);
        }
      }
    } else {
      retGrouplist = grouplist.slice(0);
      for (const groupName in grouplist) {
        if (groupType[groupName] === 'vc') {
          retVirtualCluster.push(groupName);
        }
      }
    }
    return {
      virtualCluster: retVirtualCluster,
      grouplist: retGrouplist,
    };
  } catch (error) {
    throw error;
  }
};

const updateGroup2ExnternalMapper = async () => {
  try {
    logger.info('Begin to update group info.');
    const groupList = await getAllGroup();
    let newExternalName2Groupname = {};
    let update = false;
    for (const groupItem of groupList) {
      newExternalName2Groupname[groupItem.externalName] = groupItem.groupname;
    }
    if (Object.keys(newExternalName2Groupname).length !== Object.keys(externalName2Groupname).length) {
      update = true;
    }
    for (const [key, val] of Object.entries(newExternalName2Groupname)) {
      if (!(key in externalName2Groupname)) {
        update = true;
      } else if (externalName2Groupname[key] !== val) {
        update = true;
      }
      if (update) {
        break;
      }
    }
    if (update) {
      externalName2Groupname = newExternalName2Groupname;
    }
    logger.info('Update group info successfully.');
  } catch (error) {
    logger.info('Failed to update group info.');
    throw error;
  }
};

const initGrouplistInCfg = async () => {
  try {
    logger.info('Create admin group configured in configuration.');
    const adminGroup = {
      'groupname': authConfig.groupConfig.adminGroup.groupname,
      'description': authConfig.groupConfig.adminGroup.description,
      'externalName': authConfig.groupConfig.adminGroup.externalName,
      'extension': authConfig.groupConfig.adminGroup.extension,
    };
    await createGroupIfNonExistent(adminGroup.groupname, adminGroup);
    logger.info('Create admin group successfully.');
    logger.info('create default vc\'s group.');
    const defaultVCGroup = {
      'groupname': authConfig.groupConfig.defaultGroup.groupname,
      'description': authConfig.groupConfig.defaultGroup.description,
      'externalName': authConfig.groupConfig.defaultGroup.externalName,
      'extension': authConfig.groupConfig.defaultGroup.extension,
    };
    await createGroupIfNonExistent(defaultVCGroup.groupname, defaultVCGroup);
    logger.info('Create default group successfully.');
    logger.info('Create non-admin group configured in configuration.');
    for (const groupItem of authConfig.groupConfig.grouplist) {
      await createGroupIfNonExistent(groupItem.groupname, groupItem);
    }
    logger.info('Create non-admin group successfully.');
  } catch (error) {
    logger.error('Failed to create admin group configured in configuration.');
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

const createAdminUser = async () => {
  try {
    logger.info('Create admin user account configured in configuration.');
    const groupInfoList = authConfig.groupConfig.grouplist;
    let groupnameList = [];
    let virtualCluster = [];
    for (let groupItem of groupInfoList) {
      groupnameList.push(groupItem['groupname']);
      if (groupItem['extension']['groupType'] === 'vc') {
        virtualCluster.push(groupItem['groupname']);
      }
    }
    groupnameList.push(authConfig.groupConfig.adminGroup.groupname);
    groupnameList.push(authConfig.groupConfig.defaultGroup.groupname);
    virtualCluster.push(authConfig.groupConfig.defaultGroup.groupname);
    const userValue = {
      username: secretConfig.adminName,
      email: '',
      password: secretConfig.adminPass,
      grouplist: groupnameList,
      extension: {
        virtualCluster: virtualCluster,
      },
    };
    await userModel.createUserIfNonExistent(userValue.username, userValue);
    logger.info('Create admin user account successfully.');
  } catch (error) {
    logger.error('Failed to create admin user account configured in configuration.');
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

const updateUserGroupAndVirtualCluster = async () => {
  try {
    logger.info('Update User Grouplist at the start stage.');
    logger.info('Init user list to update.');
    let groupInfoList = await getAllGroup();
    let groupnameList = [];
    let userList = await userModel.getAllUser();
    let updateUserList = [];
    for (let groupItem of groupInfoList) {
      groupnameList.push(groupItem['groupname']);
    }
    for (let userItem of userList) {
      let updateUserGrouplist = false;
      let updateUserVirtualCluster = false;
      let userGroupList = [];
      let userVirtualClusterList = [];
      let newUserInfo = userItem;
      for (let groupname of userItem['grouplist']) {
        if (groupnameList.includes(groupname)) {
          userGroupList.push(groupname);
        } else {
          updateUserGrouplist = true;
        }
      }
      if (updateUserGrouplist) {
        newUserInfo['grouplist'] = userGroupList;
      }
      if (userItem['extension']['virtualCluster']) {
        for (let virtualClusterName of userItem['extension']['virtualCluster']) {
          if (groupnameList.includes(virtualClusterName)) {
            userVirtualClusterList.push(virtualClusterName);
          } else {
            updateUserVirtualCluster = true;
          }
        }
        if (updateUserVirtualCluster) {
          newUserInfo['extension']['virtualCluster'] = userVirtualClusterList;
        }
      }
      if (updateUserVirtualCluster || updateUserGrouplist) {
        updateUserList.push(newUserInfo);
      }
    }
    if (updateUserList.length !== 0) {
      logger.info('User list to be updated has been prepared.');
      logger.info('Begin to update user\' group list.');
      await Promise.all(updateUserList.map(async (userData) => {
        await userModel.updateUser(userData['username'], userData);
      }));
      logger.info('Update group info successfully.');
    } else {
      logger.info('No user\' grouplist need to be updated.');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

const groupTypeVCCheck = async () => {
  try {
    const groupInfoList = await getAllGroup();
    const vcList = await vcModel.prototype.getVcListAsyc();
    for (let groupItem of groupInfoList) {
      if (groupItem.extension.groupType && groupItem.extension.groupType === 'vc') {
        if (!vcList || !(groupItem.groupname in vcList)) {
          deleteGroup(groupItem.groupname);
          logger.info(`Delete vc type group [${groupItem.groupname}]. Can't find it in yarn's vc list.`);
        }
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

const groupAndUserDataInit = async () => {
  await initGrouplistInCfg();
  await groupTypeVCCheck();
  if (authConfig.authnMethod !== 'OIDC') {
    await createAdminUser();
  } else {
    await updateGroup2ExnternalMapper();
  }
  await updateUserGroupAndVirtualCluster();
};

if (config.env !== 'test') {
  if (crudType === 'zookeeper') {
    (async () => {
      await crudGroup.prepareGroupRoot(crudConfig);
    })();
  }
  groupAndUserDataInit();
  if (authConfig.authnMethod === 'OIDC') {
    setInterval(async function() {
      await updateGroup2ExnternalMapper();
    }, 600 * 1000);
  }
}

module.exports = {
  getGroup,
  getAllGroup,
  deleteGroup,
  createGroup,
  updateGroup,
  virtualCluster2GroupList,
  getUserGrouplistFromExternal,
  updateExternalName2Groupname,
  updateVirtualClusterWithGrouplist,
  updateGrouplistWithVirtualCluster,
  getAllGroupTypeObject,
};
