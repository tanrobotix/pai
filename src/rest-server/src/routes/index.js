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
const express = require('express');
const authnRouter = require('@pai/routes/authn');
const controller = require('@pai/controllers/index');
const jobRouter = require('@pai/routes/job');
const tokenRouter = require('@pai/routes/token');
const vcRouter = require('@pai/routes/vc');
const userRouter = require('@pai/routes/user');
const kubernetesProxy = require('@pai/controllers/kubernetes-proxy');
const scRouter = require('@pai/routes/subCluster');
const streamingRouter = require('@pai/routes/streaming');

const router = new express.Router();

router.route('/')
    .all(controller.index);

router.use('/jobs', jobRouter);
router.use('/virtual-clusters', vcRouter);
router.use('/kubernetes', kubernetesProxy);
router.use('/authn', authnRouter);
router.use('/token', tokenRouter);
router.use('/user', userRouter);
router.use('/subClusters', scRouter);
router.use('/sparkHistoryServer/applications', streamingRouter);

// module exports
module.exports = router;
