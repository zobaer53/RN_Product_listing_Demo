'use strict';

const ExpoNativeEnvironment = require('jest-expo/src/preset/nativeEnvironment');

/**
 * jest-expo replaces `fetch` with a lazy Expo stub that cannot perform requests in Node.
 * Keep a reference to Node's native fetch primitives so the test setup can restore them
 * and MSW can intercept real `fetch` calls made by the HTTP client.
 */
class ProductExplorerEnvironment extends ExpoNativeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.__nodeFetchPrimitives = {
      fetch: this.global.fetch,
      Request: this.global.Request,
      Response: this.global.Response,
      Headers: this.global.Headers,
      FormData: this.global.FormData,
    };
  }
}

module.exports = ProductExplorerEnvironment;
module.exports.TestEnvironment = ProductExplorerEnvironment;
