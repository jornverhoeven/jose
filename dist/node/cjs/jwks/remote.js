"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRemoteJWKSet = exports.RemoteJWKSet = void 0;
const fetch_jwks_js_1 = require("../runtime/fetch_jwks.js");
const env_js_1 = require("../runtime/env.js");
const errors_js_1 = require("../util/errors.js");
const local_js_1 = require("./local.js");
class RemoteJWKSet extends local_js_1.LocalJWKSet {
    constructor(url, options) {
        super({ keys: [] });
        this._jwks = undefined;
        if (!(url instanceof URL)) {
            throw new TypeError('url must be an instance of URL');
        }
        this._url = new URL(url.href);
        this._options = { agent: options === null || options === void 0 ? void 0 : options.agent, headers: options === null || options === void 0 ? void 0 : options.headers };
        this._timeoutDuration =
            typeof (options === null || options === void 0 ? void 0 : options.timeoutDuration) === 'number' ? options === null || options === void 0 ? void 0 : options.timeoutDuration : 5000;
        this._cooldownDuration =
            typeof (options === null || options === void 0 ? void 0 : options.cooldownDuration) === 'number' ? options === null || options === void 0 ? void 0 : options.cooldownDuration : 30000;
        this._cacheMaxAge = typeof (options === null || options === void 0 ? void 0 : options.cacheMaxAge) === 'number' ? options === null || options === void 0 ? void 0 : options.cacheMaxAge : 600000;
    }
    coolingDown() {
        return typeof this._jwksTimestamp === 'number'
            ? Date.now() < this._jwksTimestamp + this._cooldownDuration
            : false;
    }
    fresh() {
        return typeof this._jwksTimestamp === 'number'
            ? Date.now() < this._jwksTimestamp + this._cacheMaxAge
            : false;
    }
    async getKey(protectedHeader, token) {
        if (!this._jwks || !this.fresh()) {
            await this.reload();
        }
        try {
            return await super.getKey(protectedHeader, token);
        }
        catch (err) {
            if (err instanceof errors_js_1.JWKSNoMatchingKey) {
                if (this.coolingDown() === false) {
                    await this.reload();
                    return super.getKey(protectedHeader, token);
                }
            }
            throw err;
        }
    }
    async reload() {
        if (this._pendingFetch && (0, env_js_1.isCloudflareWorkers)()) {
            return new Promise((resolve) => {
                const isDone = () => {
                    if (this._pendingFetch === undefined) {
                        resolve();
                    }
                    else {
                        setTimeout(isDone, 5);
                    }
                };
                isDone();
            });
        }
        if (!this._pendingFetch) {
            this._pendingFetch = (0, fetch_jwks_js_1.default)(this._url, this._timeoutDuration, this._options)
                .then((json) => {
                if (!(0, local_js_1.isJWKSLike)(json)) {
                    throw new errors_js_1.JWKSInvalid('JSON Web Key Set malformed');
                }
                this._jwks = { keys: json.keys };
                this._jwksTimestamp = Date.now();
                this._pendingFetch = undefined;
            })
                .catch((err) => {
                this._pendingFetch = undefined;
                throw err;
            });
        }
        await this._pendingFetch;
    }
}
exports.RemoteJWKSet = RemoteJWKSet;
function createRemoteJWKSet(url, options) {
    return RemoteJWKSet.prototype.getKey.bind(new RemoteJWKSet(url, options));
}
exports.createRemoteJWKSet = createRemoteJWKSet;
