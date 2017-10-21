/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

/* eslint-env mocha */

const UsesRelPreload = require('../../audits/uses-rel-preload.js');
const assert = require('assert');

const mockArtifacts = (networkRecords, mockChain) => {
  return {
    devtoolsLogs: {
      [UsesRelPreload.DEFAULT_PASS]: [],
    },
    requestNetworkRecords: () => {
      return Promise.resolve(networkRecords);
    },
    requestCriticalRequestChains: function() {
      return Promise.resolve(mockChain);
    },
  };
};

describe('Performance: uses-rel-preload audit', () => {
  it(`should suggest preload resource`, () => {
    const networkRecords = [
      {
        requestId: '3',
        _isLinkPreload: false,
        url: 'http://www.example.com/script.js',
      },
    ];

    const chains = {
      '1': {
        children: {
          '2': {
            children: {
              '3': {
                request: {
                  startTime: 0,
                  endTime: 10,
                },
              },
            },
          },
        },
      },
    };

    return UsesRelPreload.audit(mockArtifacts(networkRecords, chains)).then(output => {
      assert.equal(output.rawValue, 10000);
      assert.equal(output.details.items.length, 1);
    });
  });

  it(`shouldn't suggest preload for already preloaded records`, () => {
    const networkRecords = [
      {
        requestId: '3',
        _isLinkPreload: true,
      },
    ];

    const chains = {
      '1': {
        children: {
          '2': {
            children: {
              '3': {
                request: {
                  startTime: 0,
                  endTime: 10,
                },
              },
            },
          },
        },
      },
    };

    return UsesRelPreload.audit(mockArtifacts(networkRecords, chains)).then(output => {
      assert.equal(output.rawValue, 0);
      assert.equal(output.details.items.length, 0);
    });
  });

  it(`shouldn't suggest preload for protocol data`, () => {
    const networkRecords = [
      {
        requestId: '3',
        protocol: 'data',
      },
    ];

    const chains = {
      '1': {
        children: {
          '2': {
            children: {
              '3': {
                request: {
                  startTime: 0,
                  endTime: 10,
                },
              },
            },
          },
        },
      },
    };

    return UsesRelPreload.audit(mockArtifacts(networkRecords, chains)).then(output => {
      assert.equal(output.rawValue, 0);
      assert.equal(output.details.items.length, 0);
    });
  });
});
