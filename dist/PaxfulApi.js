"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaxfulApi = void 0;
var commands_1 = require("./commands");
var Invoke_1 = require("./commands/Invoke");
var CredentialStorage_1 = require("./oauth/CredentialStorage");
var RefreshIfNeeded_1 = require("./commands/RefreshIfNeeded");
/**
 * Interface responsable for exposing Paxful API integration.
 * @public
 */
var PaxfulApi = /** @class */ (function () {
    function PaxfulApi(configuration, credentialStorage) {
        this.apiConfiguration = configuration;
        this.credentialStorage = credentialStorage || new CredentialStorage_1.InMemoryCredentialStorage();
        this.validateAndSetDefaultParameters(configuration);
    }
    /**
     * Redirect the user to authorize the access.
     * @param response
     */
    PaxfulApi.prototype.login = function (response) {
        return (0, commands_1.authorize)(response, this.apiConfiguration);
    };
    /**
     * Retrieve the tokens with the code generated by {@link PaxfulApi/login}
     * @param code returned by the redirect after user authorizes the application.
     * @return a promise for {@link Credentials}
     */
    PaxfulApi.prototype.impersonatedCredentials = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.saveToken((0, commands_1.retrieveImpersonatedCredentials)(this.apiConfiguration, code))];
            });
        });
    };
    /**
     * Force credentials refresh
     * @return a promise for {@link Credentials}
     */
    PaxfulApi.prototype.refreshCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.saveToken((0, RefreshIfNeeded_1.fetchRefreshedCredentials)(this.credentialStorage, this.apiConfiguration))];
            });
        });
    };
    /**
     * Retrieve the tokens for using your own account.
     */
    PaxfulApi.prototype.myCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.saveToken((0, commands_1.retrievePersonalCredentials)(this.apiConfiguration))];
            });
        });
    };
    /**
     * Get current logged user profile.
     */
    PaxfulApi.prototype.getProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, commands_1.getProfile)(this.credentialStorage, this.apiConfiguration)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Invokes an API operation on behalf of currently authenticated user. Designed for working with Paxful API.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param payload - (Optional) Payload of the request
     */
    PaxfulApi.prototype.invoke = function (url, payload) {
        if (payload && (0, Invoke_1.containsBinary)(payload)) {
            return this.upload(url, payload);
        }
        var requestBuilder = new Invoke_1.RequestBuilder("".concat(process.env.PAXFUL_DATA_HOST).concat(url))
            .withMethod("POST");
        // API expects form data almost always
        requestBuilder.withHeader("Content-Type", "application/x-www-form-urlencoded");
        if (payload) {
            requestBuilder.withFormData(payload);
        }
        if (url.endsWith('trade-chat/image')) {
            requestBuilder.acceptBinary();
        }
        else {
            requestBuilder.acceptJson();
        }
        return (0, commands_1.executeRequestAuthorized)(requestBuilder, this.apiConfiguration, this.credentialStorage);
    };
    /**
     * Uploads files on behalf of currently authenticated user,
     * assumes that payload contains multipart form data.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param payload - (Optional) Payload of the request
     * @param method - (Optional) Method to use. Default: POST
     */
    PaxfulApi.prototype.upload = function (url, payload, method) {
        if (method === void 0) { method = "POST"; }
        return (0, commands_1.executeRequestAuthorized)((new Invoke_1.RequestBuilder("".concat(process.env.PAXFUL_DATA_HOST).concat(url))
            .acceptJson()
            .withMethod(method)
            .withMultipartFormData(payload)), this.apiConfiguration, this.credentialStorage);
    };
    /**
     * Downloads file on behalf of currently authenticated user,
     * assumes that response will be binary file.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param payload - (Optional) arguments. Passed as url params in case of GET, or as FormData in case of other methods.
     * @param method - (Optional) Method to use. Default: GET
     */
    PaxfulApi.prototype.download = function (url, payload, method) {
        if (payload === void 0) { payload = {}; }
        if (method === void 0) { method = "GET"; }
        var requestBuilder = new Invoke_1.RequestBuilder("".concat(process.env.PAXFUL_DATA_HOST).concat(url))
            .acceptBinary()
            .withMethod(method);
        if (method === "GET") {
            requestBuilder.withUrlParams(payload);
        }
        else {
            requestBuilder.withFormData(payload);
        }
        return (0, commands_1.executeRequestAuthorized)(requestBuilder, this.apiConfiguration, this.credentialStorage);
    };
    /**
     * Invokes a GET API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param params - (Optional) url parameters to send
     */
    PaxfulApi.prototype.get = function (url, params) {
        if (params === void 0) { params = {}; }
        return (0, commands_1.executeRequestAuthorized)((new Invoke_1.RequestBuilder("".concat(process.env.PAXFUL_DATA_HOST).concat(url))
            .acceptJson()
            .withMethod("GET")
            .withUrlParams(params)), this.apiConfiguration, this.credentialStorage);
    };
    /**
     * Invokes a POST API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param json - (Optional) any json data
     */
    PaxfulApi.prototype.post = function (url, json) {
        return this.invokeJsonMethod(url, "POST", json);
    };
    /**
     * Invokes a DELETE API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param json - (Optional) any json data
     */
    PaxfulApi.prototype.delete = function (url, json) {
        return this.invokeJsonMethod(url, "DELETE", json);
    };
    /**
     * Invokes a PUT API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param json - (Optional) any json data
     */
    PaxfulApi.prototype.put = function (url, json) {
        return this.invokeJsonMethod(url, "PUT", json);
    };
    /**
     * Invokes a PATCH API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param json - (Optional) any json data
     */
    PaxfulApi.prototype.patch = function (url, json) {
        return this.invokeJsonMethod(url, "PATCH", json);
    };
    PaxfulApi.prototype.invokeJsonMethod = function (url, method, json) {
        return (0, commands_1.executeRequestAuthorized)((new Invoke_1.RequestBuilder("".concat(process.env.PAXFUL_DATA_HOST).concat(url))
            .acceptJson()
            .withMethod(method)
            .withJsonData(json)), this.apiConfiguration, this.credentialStorage);
    };
    PaxfulApi.prototype.validateAndSetDefaultParameters = function (configuration) {
        var _a, _b;
        var defaultOAuthHost = "https://accounts.paxful.com";
        var defaultDataHost = "https://api.paxful.com";
        if (!configuration.scope || configuration.scope.length === 0) {
            this.apiConfiguration.scope = ["profile", "email"];
        }
        if (process.env.PAXFUL_OAUTH_HOST === "") {
            process.env.PAXFUL_OAUTH_HOST = defaultOAuthHost;
        }
        else {
            process.env.PAXFUL_OAUTH_HOST = (_a = process.env.PAXFUL_OAUTH_HOST) !== null && _a !== void 0 ? _a : defaultOAuthHost;
        }
        if (process.env.PAXFUL_DATA_HOST === "" || !process.env.PAXFUL_DATA_HOST) {
            process.env.PAXFUL_DATA_HOST = defaultDataHost;
        }
        else {
            process.env.PAXFUL_DATA_HOST = (_b = process.env.PAXFUL_DATA_HOST) !== null && _b !== void 0 ? _b : defaultDataHost;
        }
    };
    PaxfulApi.prototype.saveToken = function (credentialsPromise) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = this.credentialStorage).saveCredentials;
                        return [4 /*yield*/, credentialsPromise];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/, credentialsPromise];
                }
            });
        });
    };
    return PaxfulApi;
}());
exports.PaxfulApi = PaxfulApi;
//# sourceMappingURL=PaxfulApi.js.map