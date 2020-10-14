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

const tokenModel = require('@pai/models/v2/token');

const deleteUserTemplate = JSON.stringify({
  'username': '{{username}}'
});

const schedulerResponse = {
        'scheduler': {
          'schedulerInfo': {
            'queues': {
              'queue': [
                {
                  'queueName': 'default',
                  'state': 'RUNNING',
                  'type': 'capacitySchedulerLeafQueueInfo',
                  "absoluteCapacity": 30.000002,
                  "absoluteMaxCapacity": 100,
                  "capacities": {
                    "queueCapacitiesByPartition": [
                      {
                        "partitionName": "",
                        "capacity": 30.000002,
                        "usedCapacity": 0,
                        "maxCapacity": 100,
                        "absoluteCapacity": 30.000002,
                        "absoluteUsedCapacity": 0,
                        "absoluteMaxCapacity": 100,
                        "maxAMLimitPercentage": 0
                      }
                    ]
                  },
                  "resources": {
                    "resourceUsagesByPartition": [
                      {
                        "partitionName": "",
                        "used": {
                            "memory": 0,
                            "vCores": 0,
                            "GPUs": 0
                        }
                      }
                    ]
                  }
                },
                {
                  'queueName': 'vc1',
                  'state': 'RUNNING',
                  'type': 'capacitySchedulerLeafQueueInfo',
                  "capacity": 50.000002,
                  "absoluteCapacity": 0,
                  "absoluteMaxCapacity": 100,
                  "capacities": {
                    "queueCapacitiesByPartition": [
                      {
                        "partitionName": "",
                        "capacity": 50.000002,
                        "usedCapacity": 0,
                        "maxCapacity": 100,
                        "absoluteCapacity": 50.000002,
                        "absoluteUsedCapacity": 0,
                        "absoluteMaxCapacity": 100,
                        "maxAMLimitPercentage": 0
                      }
                    ]
                  },
                  "resources": {
                    "resourceUsagesByPartition": [
                      {
                        "partitionName": "",
                        "used": {
                            "memory": 0,
                            "vCores": 0,
                            "GPUs": 0
                        }
                      }
                    ]
                  }
                },
                {
                  'queueName': 'vc2',
                  'state': 'RUNNING',
                  'type': 'capacitySchedulerLeafQueueInfo',
                  "capacity": 19.999996,
                  "absoluteCapacity": 0,
                  "absoluteMaxCapacity": 100,
                  "capacities": {
                    "queueCapacitiesByPartition": [
                      {
                        "partitionName": "",
                        "capacity": 19.999996,
                        "usedCapacity": 0,
                        "maxCapacity": 100,
                        "absoluteCapacity": 19.999996,
                        "absoluteUsedCapacity": 0,
                        "absoluteMaxCapacity": 100,
                        "maxAMLimitPercentage": 0
                      }
                    ]
                  },
                  "resources": {
                    "resourceUsagesByPartition": [
                      {
                        "partitionName": "",
                        "used": {
                            "memory": 0,
                            "vCores": 0,
                            "GPUs": 0
                        }
                      }
                    ]
                  }
                }
              ]
            },
            'type': 'capacityScheduler',
            'usedCapacity': 0.0
          }
        }
      };

const nodeResponse = {
      "nodes": {
        "node": [
          {
            "rack": "/default-rack",
            "state": "RUNNING",
            "id": "10.151.40.132:8041",
            "nodeHostName": "10.151.40.132",
            "nodeHTTPAddress": "10.151.40.132:8042",
            "numContainers": 2,
            "usedMemoryMB": 3072,
            "availMemoryMB": 205824,
            "usedVirtualCores": 2,
            "availableVirtualCores": 22,
            "usedGPUs": 1,
            "availableGPUs": 3,
            "availableGPUAttribute": 14,
            "nodeLabels": [
                "test_vc"
            ],
          },
          {
            "rack": "/default-rack",
            "state": "RUNNING",
            "id": "10.151.40.131:8041",
            "nodeHostName": "10.151.40.131",
            "nodeHTTPAddress": "10.151.40.131:8042",
            "numContainers": 2,
            "usedMemoryMB": 3072,
            "availMemoryMB": 205824,
            "usedVirtualCores": 2,
            "availableVirtualCores": 22,
            "usedGPUs": 1,
            "availableGPUs": 3,
            "availableGPUAttribute": 14,
          }
        ]
      }
    };


//
// Get a valid token that expires in 60 seconds.
//
const validToken = tokenModel.create('new_user', true);
const nonAdminToken = tokenModel.create('non_admin_user', false);
const invalidToken = '';

describe('Add new user: put /api/v2/user', () => {
  after(function() {
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error('Not all nock interceptors were used!');
    }
  });

  before(() => {

    // mock for case1 username=newuser

    nock(apiServerRootUri)
      .post('/api/v1/namespaces/pai-user-v2/secrets', {
        'metadata': {'name': '6e657775736572'},
        'data': {
          'password': 'OTZkYmQyNjUwZDVmNzAzYmMzZTcwMmI0MjFmNTk2NWFjYzdiYjVjZGNlMGM5YjgzYzI3NDI4NTk5OTYxNjg2NzA2ZGI1ZGZkOGQwMmQxZTc0ODVlZjJkNmJiYzhjMjFiNjU1NjdkZjUxZTU1ZTczNzdjYjJlZDNjMDUzZmY2NzU=',
          'username': 'bmV3dXNlcg==',
          'email': 'dGVzdEBwYWkuY29t',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIiwiYWRtaW5Hcm91cCJd',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19'
        }
      })
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
            'name': '6e657775736572',
            'namespace': 'pai-user',
            'selfLink': '/api/v1/namespaces/pai-user-v2/secrets/6e657775736572',
            'uid': 'f75b6065-f9c7-11e8-b564-000d3ab5296b',
            'resourceVersion': '1116114',
            'creationTimestamp': '2018-12-07T02:29:47Z'
        },
        'data': {
          'password': 'OTZkYmQyNjUwZDVmNzAzYmMzZTcwMmI0MjFmNTk2NWFjYzdiYjVjZGNlMGM5YjgzYzI3NDI4NTk5OTYxNjg2NzA2ZGI1ZGZkOGQwMmQxZTc0ODVlZjJkNmJiYzhjMjFiNjU1NjdkZjUxZTU1ZTczNzdjYjJlZDNjMDUzZmY2NzU=',
          'username': 'bmV3dXNlcg==',
          'email': 'dGVzdEBwYWkuY29t',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIiwiYWRtaW5Hcm91cCJd',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19'
        },
        'type': 'Opaque'
      });

    // mock for case2 add non-admin user

    nock(apiServerRootUri)
      .post('/api/v1/namespaces/pai-user-v2/secrets', {
        'metadata': {'name': '6e6f6e5f61646d696e'},
        'data': {
          'username': 'bm9uX2FkbWlu',
          'password': 'NDNmMWQ5NGNiZDUxNzViZjdmM2VkYzhkMjhhZWE1NjgxY2Q4M2E0MThhMzI4MWY3ZmI3MjRkYWRmYjJkMThmZjM0YjNhM2E0MDM3YjA2ZTU5OWYzYTU4YzU0M2JiZTIzMzAwYjc4NzJkMzkyNmE0MDBkN2RkNjhkOTg2NzdhYmY=',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19'
        },
      })
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
            'name': '6e6f6e5f61646d696e',
            'namespace': 'pai-user',
            'selfLink': '/api/v1/namespaces/pai-user-v2/secrets/6e6f6e5f61646d696e',
            'uid': 'f75b6065-f9c7-11e8-b564-000d3ab5296b',
            'resourceVersion': '1116114',
            'creationTimestamp': '2018-12-07T02:29:47Z'
        },
        'data': {
          'username': 'bm9uX2FkbWlu',
          'password': 'NDNmMWQ5NGNiZDUxNzViZjdmM2VkYzhkMjhhZWE1NjgxY2Q4M2E0MThhMzI4MWY3ZmI3MjRkYWRmYjJkMThmZjM0YjNhM2E0MDM3YjA2ZTU5OWYzYTU4YzU0M2JiZTIzMzAwYjc4NzJkMzkyNmE0MDBkN2RkNjhkOTg2NzdhYmY=',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19'
        },
        'type': 'Opaque'
      });


    // mock for case4 username=existuser.
    nock(apiServerRootUri)
      .post('/api/v1/namespaces/pai-user-v2/secrets', {
        'metadata': {'name': '657869737475736572'},
        'data': {
          'username': 'ZXhpc3R1c2Vy',
          'password': 'NTE5ODZmNDg4NWI3N2YzMGE2ODVmMzFiZjdhNDg4MTc2MmIzN2IyYWJhNDFiNGRjY2E4YjQwZGYyNWY4NWNlMTc0MjU0NDI2MTFmNDBkMDNiNDc1MTM2MTFmZjIwYTAzNWJmZDZjYWRlYjgwNzE1YjgyYjM1N2EzYjhiYzk3Nzc=',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19'
        },
      })
      .reply(409, {
        'kind': 'Status',
        'apiVersion': 'v1',
        'metadata': {},
        'status': 'Failure',
        'message': 'secrets \'657869737475736572\' already exists',
        'reason': 'AlreadyExists',
        'details': {
          'name': '657869737475736572',
          'kind': 'secrets'
        },
        'code': 409
      });


    // Mock for case1 return all groupinfo
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-group/secrets')
      .times(4)
      .reply(200, {
        'kind': 'SecretList',
        'apiVersion': 'v1',
        'metadata': {
          'selfLink': '/api/v1/namespaces/pai-group/secrets/',
          'resourceVersion': '1062682'
        },
        'items': [
          {
            'metadata': {
              'name': 'cantest001',
            },
            'data': {
              'groupname': 'ZGVmYXVsdA==',
              'description': 'dGVzdA==',
              'externalName': 'MTIzNA==',
              'extension': 'eyJncm91cFR5cGUiOiJ2YyJ9',
            },
            'type': 'Opaque'
          },
          {
            'metadata': {
              'name': 'pai_test',
            },
            'data': {
              'groupname': 'dmMx',
              'description': 'dGVzdA==',
              'externalName': 'MTIzNA==',
              'extension': 'eyJncm91cFR5cGUiOiJ2YyJ9'
            },
            'type': 'Opaque'
          },
          {
            'metadata': {
              'name': 'pai_test_1',
            },
            'data': {
              'groupname': 'dmMy',
              'description': 'dGVzdA==',
              'externalName': 'MTIzNA==',
              'extension': 'eyJncm91cFR5cGUiOiJ2YyJ9'
            },
            'type': 'Opaque'
          },
          {
            'metadata': {
              'name': 'pai_test_2',
            },
            'data': {
              'groupname': 'YWRtaW5Hcm91cA==',
              'description': 'dGVzdA==',
              'externalName': 'MTIzNA==',
              'extension': 'eyJncm91cFR5cGUiOiJhZG1pbiJ9'
            },
            'type': 'Opaque'
          },
        ]
      });


});

  //
  // Positive cases
  //

  it('Case 1 (Positive): Add admin user', (done) => {
    global.chai.request(global.server)
      .post('/api/v2/user')
      .set('Authorization', 'Bearer ' + validToken)
      .send({
          'username': 'newuser',
          'password': '123456',
          'email': 'test@pai.com',
          'virtualCluster': ['default','vc1','vc2'],
          'admin': true,
        })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(201);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.message, 'response message').equal('User is created successfully');
        done();
      });
  });

  it('Case 2 (Positive): Add non_admin user', (done) => {
    global.chai.request(global.server)
      .post('/api/v2/user')
      .set('Authorization', 'Bearer ' + validToken)
      .send({
        'username': 'non_admin',
        'password': '123456',
        'email': 'test@pai.com',
        'virtualCluster': ['default','vc1','vc2'],
        'admin': false,
      })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(201);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.message, 'response message').equal('User is created successfully');
        done();
      });
  });

  //
  // Negative cases
  //

  it('Case 3 (Negative): Should fail to add user with non-admin token.', (done) => {
    global.chai.request(global.server)
      .post('/api/v2/user')
      .set('Authorization', 'Bearer ' + nonAdminToken)
      .send({
        'username': 'test_user',
        'password': '123456',
        'email': 'test@pai.com',
        'virtualCluster': ['default','vc1','vc2'],
        'admin': false,
      })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(403);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('ForbiddenUserError');
        done();
      });
  });

  it('Case 4 (Negative): Should fail to add user with exist name.', (done) => {
    global.chai.request(global.server)
      .post('/api/v2/user')
      .set('Authorization', 'Bearer ' + validToken)
      .send({
        'username': 'existuser',
        'password': '123456',
        'email': 'test@pai.com',
        'virtualCluster': ['default','vc1','vc2'],
        'admin': false
      })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(409);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('ConflictUserError');
        done();
      });
  });
});

describe('update user: put /api/v2/user', () => {
  after(function() {
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error('Not all nock interceptors were used!');
    }
  });

  before(() => {

    // mock for case1 username=update_user.
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/7570646174655f75736572')
      .times(2)
      .reply(200,  {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
            'name': '7570646174655f75736572',
        },
        'data': {
            'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
            'username': 'dXBkYXRlX3VzZXI=',
            'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
            'email': 'dGVzdEBwYWkuY29t',
            'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19'
        },
        'type': 'Opaque'
    });

    nock(apiServerRootUri)
    .put('/api/v1/namespaces/pai-user-v2/secrets/7570646174655f75736572', {
      'metadata':{'name':'7570646174655f75736572'},
      'data': {
        'password': 'ZjRiNTU3ZjhmZWJiOTMyOGE2NTg1YzBiNGZkYWEyZjk3YWQyZjBjOGYwMTZlZWRkZTcyNzNkYjRkMmUwNTc4OWRkYjY5MGQ5NzAzODgyZWNiMjMxMzQxMGU2MjdlMWI1ZGQ4ZjdhNjdkYjczZGQ0NGI2ZjUxZTA4YjAxMGI3OGE=',
        'username': 'dXBkYXRlX3VzZXI=',
        'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
        'email': 'dGVzdEBwYWkuY29t',
        'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19'
       }
     })
    .reply(200, {
      'kind': 'Secret',
      'apiVersion': 'v1',
      'metadata': {
          'name': 'updateuser',
          'namespace': 'pai-user',
          'selfLink': '/api/v1/namespaces/pai-user-v2/secrets/7570646174655f75736572',
          'uid': 'd5d686ff-f9c6-11e8-b564-000d3ab5296b',
          'resourceVersion': '1115478',
          'creationTimestamp': '2018-12-07T02:21:42Z'
      },
      'data': {
        'password': 'ZjRiNTU3ZjhmZWJiOTMyOGE2NTg1YzBiNGZkYWEyZjk3YWQyZjBjOGYwMTZlZWRkZTcyNzNkYjRkMmUwNTc4OWRkYjY5MGQ5NzAzODgyZWNiMjMxMzQxMGU2MjdlMWI1ZGQ4ZjdhNjdkYjczZGQ0NGI2ZjUxZTA4YjAxMGI3OGE=',
        'username': 'dXBkYXRlX3VzZXI=',
        'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
        'email': 'dGVzdEBwYWkuY29t',
        'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19'
      },
      'type': 'Opaque'
    });

    // mock for case2 username=update_user.
    nock(apiServerRootUri)
    .put('/api/v1/namespaces/pai-user-v2/secrets/7570646174655f75736572', {
      'metadata':{'name':'7570646174655f75736572'},
      'data': {
         'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
         'username': 'dXBkYXRlX3VzZXI=',
         'grouplist':'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
         'email': 'dGVzdEBwYWkuY29t',
         'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19',
       }
     })
    .reply(200, {
      'kind': 'Secret',
      'apiVersion': 'v1',
      'metadata': {
          'name': '7570646174655f75736572',
          'namespace': 'pai-user',
          'selfLink': '/api/v1/namespaces/pai-user-v2/secrets/7570646174655f75736572',
          'uid': 'd5d686ff-f9c6-11e8-b564-000d3ab5296b',
          'resourceVersion': '1115478',
          'creationTimestamp': '2018-12-07T02:21:42Z'
      },
      'data': {
        'password': 'ZjRiNTU3ZjhmZWJiOTMyOGE2NTg1YzBiNGZkYWEyZjk3YWQyZjBjOGYwMTZlZWRkZTcyNzNkYjRkMmUwNTc4OWRkYjY5MGQ5NzAzODgyZWNiMjMxMzQxMGU2MjdlMWI1ZGQ4ZjdhNjdkYjczZGQ0NGI2ZjUxZTA4YjAxMGI3OGE=',
        'username': 'dXBkYXRlX3VzZXI=',
        'grouplist':'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
        'email': 'dGVzdEBwYWkuY29t',
        'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19',
      },
      'type': 'Opaque'
    });

    // mock for case3 username=non_exist_user.
    nock(apiServerRootUri)
    .get('/api/v1/namespaces/pai-user-v2/secrets/6e6f6e5f65786973745f75736572')
    .reply(404, {
      'kind': 'Status',
      'apiVersion': 'v1',
      'metadata': {},
      'status': 'Failure',
      'message': 'secrets \'6e6f6e5f65786973745f75736572\' not found',
      'reason': 'NotFound',
      'details': {
          'name': '6e6f6e5f65786973745f75736572',
          'kind': 'secrets'
      },
      'code': 404
    });


  });

  //
  // Positive cases
  //

  it('Case 1 (Positive): Update user password.', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/update_user/password')
      .set('Authorization', 'Bearer ' + validToken)
      .send({
        'newPassword': 'abcdef',
        'oldPassword': 'test12345'
      })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(201);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.message, 'response message').equal('update user password successfully.');
        done();
      });
  });

  it('Case 2 (Positive): Update user set admin=false.', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/update_user/admin')
      .set('Authorization', 'Bearer ' + validToken)
      .send({
        'admin': false
      })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(201);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.message, 'response message').equal('Update user admin permission successfully.');
        done();
      });
  });

  //
  // Negative cases
  //

  it('Case 3 (Negative): Should fail to modify a non-exist user.', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/non_exist_user/password')
      .set('Authorization', 'Bearer ' + validToken)
      .send({
        'newPassword': 'abcdef',
        'oldPassword': 'test12345'
      })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(404);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('NoUserError');
        done();
      });
  });

  it('Case 4 (Negative): Should trigger validation error if password sets null.', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/new_user/password')
      .set('Authorization', 'Bearer ' + validToken)
      .send({
        'oldPassword': 'test12345'
      })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(400);
        done();
      });
  });

  it('Case 5 (Negative): Should fail to update user with non-admin token.', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/new_user/admin')
      .set('Authorization', 'Bearer ' + nonAdminToken)
      .send({
        'admin': false
      })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(403);
        global.chai.expect(res.body.code, 'response code').equal('ForbiddenUserError');
        done();
      });
  });

});

describe('delete user : delete /api/v2/user', () => {
  afterEach(function() {
    if (!nock.isDone()) {
      //TODO: Revamp this file and enable the following error.
      //this.test.error(new Error('Not all nock interceptors were used!'));
      nock.cleanAll();
    }
  });

  beforeEach(() => {

    // mock for case1 username=non_admin.
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/6e6f6e5f61646d696e')
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
          'name': '6e6f6e5f61646d696e',
        },
        'data': {
          'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
          'username': 'bm9uX2FkbWlu',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19',
        },
        'type': 'Opaque'
      });

    nock(apiServerRootUri)
      .delete('/api/v1/namespaces/pai-user-v2/secrets/6e6f6e5f61646d696e')
      .reply(200, {
        'kind': 'Status',
        'apiVersion': 'v1',
        'metadata': {},
        'status': 'Success',
        'details': {
          'name': '6e6f6e5f61646d696e',
          'kind': 'secrets',
          'uid': 'd5d686ff-f9c6-11e8-b564-000d3ab5296b'
        }
      });

    // mock for case2 username=admin.
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/61646d696e')
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
          'name': 'paitest',
        },
        'data': {
          'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
          'username': 'YWRtaW4=',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIiwiYWRtaW5Hcm91cCJd',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19',
        },
        'type': 'Opaque'
      });

    // mock for case3 username=non_exist.
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/6e6f6e6578697374')
      .reply(404, {
        'kind': 'Status',
        'apiVersion': 'v1',
        'metadata': {},
        'status': 'Failure',
        'message': 'secrets \'6e6f6e6578697374\' not found',
        'reason': 'NotFound',
        'details': {
            'name': 'nonexist',
            'kind': 'secrets'
        },
        'code': 404
      });
  });

  //
  // Positive cases
  //

  it('Case 1 (Positive): delete exist non_admin user', (done) => {
    global.chai.request(global.server)
      .delete('/api/v2/user/non_admin')
      .set('Authorization', 'Bearer ' + validToken)
      .send()
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(200);
        done();
      });
  });


  // Negative cases


  it('Case 2 (Negative): Should fail to delete admin user', (done) => {
    global.chai.request(global.server)
      .delete('/api/v2/user/admin')
      .set('Authorization', 'Bearer ' + validToken)
      .send()
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(403);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('RemoveAdminError');
        done();
      });
  });

  it('Case 3 (Negative): Should fail to delete non-exist user.', (done) => {
    global.chai.request(global.server)
      .delete('/api/v2/user/nonexist')
      .set('Authorization', 'Bearer ' + validToken)
      .send()
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(404);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('NoUserError');
        done();
      });
  });

  it('Case 4 (Negative): Should fail to delete user with non-admin token.', (done) => {
    global.chai.request(global.server)
      .delete('/api/v2/user/delete_non_admin_user')
      .set('Authorization', 'Bearer ' + nonAdminToken)
      .send()
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(403);
        done();
      });
  });
});

describe('update user virtual cluster : put /api/v2/user/:username/virtualClusters', () => {
  afterEach(() => {
    if (!nock.isDone()) {
      //this.test.error(new Error('Not all nock interceptors were used!'));
      nock.cleanAll();
    }
  });

  beforeEach(() => {
    nock(yarnUri)
      .get('/ws/v1/cluster/scheduler')
      .reply(200, schedulerResponse)
      .get('/ws/v1/cluster/nodes')
      .reply(200, nodeResponse);

    // mock for case1 username=test
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/74657374')
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
            'name': '74657374',
        },
        'data': {
            'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
            'username': 'cGFpdGVzdA==',
            'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
            'email': 'dGVzdEBwYWkuY29t',
            'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19',
        },
        'type': 'Opaque'
    });

    nock(apiServerRootUri)
    .put('/api/v1/namespaces/pai-user-v2/secrets/74657374', {
      'metadata':{'name':'74657374'},
      'data': {
         'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
         'username': 'cGFpdGVzdA==',
         'grouplist': 'WyJkZWZhdWx0IiwidmMxIl0=',
         'email': 'dGVzdEBwYWkuY29t',
         'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIl19',
       }
     })
    .reply(200, {
      'kind': 'Secret',
      'apiVersion': 'v1',
      'metadata': {
          'name': 'test',
          'namespace': 'pai-user',
          'selfLink': '/api/v1/namespaces/pai-user/secrets/test',
          'uid': 'd5d686ff-f9c6-11e8-b564-000d3ab5296b',
          'resourceVersion': '1115478',
          'creationTimestamp': '2018-12-07T02:21:42Z'
      },
      'data': {
        'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
        'username': 'cGFpdGVzdA==',
        'grouplist': 'WyJkZWZhdWx0IiwidmMxIl0=',
        'email': 'dGVzdEBwYWkuY29t',
        'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIl19',
      },
      'type': 'Opaque'
    });

    // mock for case2 username=test2
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/7465737432')
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
          'name': '7465737432',
        },
        'data': {
          'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
          'username': 'cGFpdGVzdA==',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIl0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIl19',
        },
        'type': 'Opaque'
      });

    // mock for case3 username=test3
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/7465737433')
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
          'name': '7465737433',
        },
        'data': {
          'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI==',
          'username': 'dGVzdHVzZXIz',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIl0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19',
        },
        'type': 'Opaque'
      });

    nock(apiServerRootUri)
      .put('/api/v1/namespaces/pai-user-v2/secrets/7465737433', {
        'metadata':{'name':'7465737433'},
        'data': {
           'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
           'username': 'dGVzdHVzZXIz',
          'grouplist': 'WyJkZWZhdWx0Il0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0Il19',
         }
       })
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
            'name': '7465737433',
            'namespace': 'pai-user',
            'selfLink': '/api/v1/namespaces/pai-user/secrets/existuser',
            'uid': 'd5d686ff-f9c6-11e8-b564-000d3ab5296b',
            'resourceVersion': '1115478',
            'creationTimestamp': '2018-12-07T02:21:42Z'
        },
        'data': {
            'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
            'username': 'dGVzdHVzZXIz',
          'grouplist': 'WyJkZWZhdWx0Il0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0Il19',
        },
        'type': 'Opaque'
      });

    // mock for case4 username=test_invalid
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/74657374696e76616c6964')
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
          'name': '74657374696e76616c6964',
        },
        'data': {
          'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI==',
          'username': 'dGVzdHVzZXIz',
          'grouplist': 'WyJkZWZhdWx0Il0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0Il19',
        },
        'type': 'Opaque'
      });

    // mock for case5 username=non_exist
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/6e6f6e5f6578697374')
      .reply(404, {
        'kind': 'Status',
        'apiVersion': 'v1',
        'metadata': {},
        'status': 'Failure',
        'message': 'secrets \'6e6f6e5f6578697374\' not found',
        'reason': 'NotFound',
        'details': {
            'name': '6e6f6e5f6578697374',
            'kind': 'secrets'
        },
        'code': 404
      });

    // mock for case6 username=test6
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/test6')
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
          'name': 'test6',
        },
        'data': {
          'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
          'username': 'cGFpdGVzdA==',
          'grouplist': 'WyJkZWZhdWx0Il0=',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0Il19',
        },
        'type': 'Opaque'
      });

    // mock for case7 username=test7
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user-v2/secrets/7465737437')
      .reply(200, {
        'kind': 'Secret',
        'apiVersion': 'v1',
        'metadata': {
          'name': '7465737437',
        },
        'data': {
          'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
          'username': 'cGFpdGVzdA==',
          'grouplist': 'WyJkZWZhdWx0IiwidmMxIiwidmMyIiwiYWRtaW5Hcm91cCJd',
          'email': 'dGVzdEBwYWkuY29t',
          'extension': 'eyJ2aXJ0dWFsQ2x1c3RlciI6WyJkZWZhdWx0IiwidmMxIiwidmMyIl19',
        },
        'type': 'Opaque'
      });

    // Mock for case1 return all groupinfo
    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-group/secrets')
      .times(8)
      .reply(200, {
        'kind': 'SecretList',
        'apiVersion': 'v1',
        'metadata': {
          'selfLink': '/api/v1/namespaces/pai-group/secrets/',
          'resourceVersion': '1062682'
        },
        'items': [
          {
            'metadata': {
              'name': 'cantest001',
            },
            'data': {
              'groupname': 'ZGVmYXVsdA==',
              'description': 'dGVzdA==',
              'externalName': 'MTIzNA==',
              'extension': 'eyJncm91cFR5cGUiOiJ2YyJ9',
            },
            'type': 'Opaque'
          },
          {
            'metadata': {
              'name': 'pai_test',
            },
            'data': {
              'groupname': 'dmMx',
              'description': 'dGVzdA==',
              'externalName': 'MTIzNA==',
              'extension': 'eyJncm91cFR5cGUiOiJ2YyJ9'
            },
            'type': 'Opaque'
          },
          {
            'metadata': {
              'name': 'pai_test_1',
            },
            'data': {
              'groupname': 'dmMy',
              'description': 'dGVzdA==',
              'externalName': 'MTIzNA==',
              'extension': 'eyJncm91cFR5cGUiOiJ2YyJ9'
            },
            'type': 'Opaque'
          },
          {
            'metadata': {
              'name': 'pai_test_2',
            },
            'data': {
              'groupname': 'YWRtaW5Hcm91cA==',
              'description': 'dGVzdA==',
              'externalName': 'MTIzNA==',
              'extension': 'eyJncm91cFR5cGUiOiJhZG1pbiJ9'
            },
            'type': 'Opaque'
          },
        ]
      });

  });

  //
  // Get a valid token that expires in 60 seconds.
  //

  const validToken = tokenModel.create('admin_user', true);
  const nonAdminToken = tokenModel.create('non_admin_user', false);
  const invalidToken = '';

  //
  // Positive cases
  //

  it('Case 1 (Positive): should update non-admin user with valid virtual cluster successfully', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/test/virtualcluster')
      .set('Authorization', 'Bearer ' + validToken)
      .send({ 'virtualCluster': ['default', 'vc1' ]})
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(201);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.message, 'response message').equal('Update user virtualCluster data successfully.');
        done();
      });
  });

  it('Case 2 (Positive): add new user with invalid virtual cluster, should return error NoVirtualClusterError', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/test2/virtualcluster')
      .set('Authorization', 'Bearer ' + validToken)
      .send({ 'virtualCluster': ['non_exist_vc'] })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(400);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('NoVirtualClusterError');
        done();
      });
  });

  it('Case 3 (Positive): should delete all virtual clusters except default when virtual cluster value sets to be empty ', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/test3/virtualcluster')
      .set('Authorization', 'Bearer ' + validToken)
      .send( { 'virtualCluster': [] })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(201);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.message, 'response message').equal('Update user virtualCluster data successfully.');
        done();
      });
  });


  // Negative cases


  it('Case 4 (Negative): should fail to update non-admin user with invalid virtual cluster', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/testinvalid/virtualcluster')
      .set('Authorization', 'Bearer ' + validToken)
      .send({ 'virtualCluster': ['non_exist_vc'] })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(400);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('NoVirtualClusterError');
        done();
      });
  });

  it('Case 5 (Negative): should fail to update non-exist user virtual cluster', (done) => {
    global.chai.request(global.server)
    .put('/api/v2/user/non_exist/virtualcluster')
    .set('Authorization', 'Bearer ' + validToken)
    .send({ 'virtualCluster': ['default'] })
    .end((err, res) => {
      global.chai.expect(res, 'status code').to.have.status(404);
      global.chai.expect(res, 'response format').be.json;
      global.chai.expect(res.body.code, 'response code').equal('NoUserError');
      done();
    });
  });

  it('Case 6 (Negative): should fail to update user with virtual cluster by non-admin user', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/test6/virtualcluster')
      .set('Authorization', 'Bearer ' + nonAdminToken)
      .send( { 'virtualCluster': ['default'] })
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(403);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('ForbiddenUserError');
        done();
      });
  });

  it('Case 7 (Negative): should fail to update admin virtual cluster', (done) => {
    global.chai.request(global.server)
      .put('/api/v2/user/test7/virtualCluster')
      .set('Authorization', 'Bearer ' + validToken)
      .send( { 'virtualCluster': ['default'] } )
      .end((err, res) => {
        global.chai.expect(res, 'status code').to.have.status(403);
        global.chai.expect(res, 'response format').be.json;
        global.chai.expect(res.body.code, 'response code').equal('ForbiddenUserError');
        done();
      });
  });

});


describe('get user info list : get /api/v1/user', () => {
  afterEach(() => {
    if (!nock.isDone()) {
      //this.test.error(new Error('Not all nock interceptors were used!'));
      nock.cleanAll();
    }
  });

  beforeEach(() => {

    nock(apiServerRootUri)
      .get('/api/v1/namespaces/pai-user/secrets/')
      .reply(200, {
        'kind': 'SecretList',
        'apiVersion': 'v1',
        'metadata': {
          'selfLink': '/api/v1/namespaces/pai-user/secrets/',
          'resourceVersion': '1062682'
        },
        'items': [
          {
            'metadata': {
              'name': 'cantest001',
            },
            'data': {
              'admin': 'ZmFsc2U=',
              'password': 'OGRiYjYyMWEwYWY0Y2NhMDk3NTU5MmJkNzQ0M2NkNzc5YzRkYjEwMzA2NGExYTE1MWI4YjAyYmNkZjJkYmEwNjBlMzFhNTRhYzI4MjJlYjZmZTY0ZTgxM2ZkODg0MzI5ZjNiYTYwMGFlNmQ2NjMzNGYwYjhkYzIwYTIyM2MzOWU=',
              'username': 'Y2FudGVzdDAwMQ==',
              'virtualCluster': 'ZGVmYXVsdA=='
            },
            'type': 'Opaque'
          },
          {
            'metadata': {
              'name': 'paitest',
            },
            'data': {
              'admin': 'dHJ1ZQ==',
              'password': 'NzU4MjA4MGM2ZTUyMDQ5ZjAyNzA1MzFhNWNhMWE1YjYxZjQwNTlmY2RiMTY3OTA0ZjkwNzA2YTA1Y2UwNGUxZDY5NTVkYWVkYTEwNjY5YTBlMWYxMzM0N2M5OTMyZTQ0NzZjYmQxOGFkNjcyYTE5ZTkwYTI3ODRiZTU2M2ExMmI=',
              'username': 'cGFpdGVzdA==',
              'virtualCluster': 'ZGVmYXVsdCx2YzIsdmMz'
            },
            'type': 'Opaque'
          },
        ]
      });
  });

  //
  // Get a valid token that expires in 60 seconds.
  //

  // const validToken = tokenModel.create('admin_user', true, 60);
  // const nonAdminToken = tokenModel.create('non_admin_user', false, 60);
  // const invalidToken = '';

  // //
  // // Positive cases
  // //

  // it('Case 1 (Positive): should get user info successfully with admin valid token', (done) => {
  //   global.chai.request(global.server)
  //     .get('/api/v1/user')
  //     .set('Authorization', 'Bearer ' + validToken)
  //     .end((err, res) => {
  //       global.chai.expect(res, 'status code').to.have.status(200);
  //       global.chai.expect(res, 'response format').be.json;
  //       global.chai.expect(res.body.length, 'job list length').to.equal(2);
  //       done();
  //     });
  // });

  //
  // Negative cases
  //

  // it('Case 1 (Negative): should fail to get user list with non-admin token', (done) => {
  //   global.chai.request(global.server)
  //     .get('/api/v1/user')
  //     .set('Authorization', 'Bearer ' + nonAdminToken)
  //     .end((err, res) => {
  //       global.chai.expect(res, 'status code').to.have.status(403);
  //       global.chai.expect(res, 'response format').be.json;
  //       global.chai.expect(res.body.code, 'response code').equal('ForbiddenUserError');
  //       done();
  //     });
  // });

});

