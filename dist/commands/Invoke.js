"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestBuilder = exports.containsBinary = void 0;
var node_fetch_1 = __importStar(require("node-fetch"));
var RefreshIfNeeded_1 = __importDefault(require("./RefreshIfNeeded"));
var ImpersonateCredentials_1 = __importDefault(require("./ImpersonateCredentials"));
var query_string_1 = __importDefault(require("query-string"));
var q_flat_1 = require("q-flat");
var form_data_1 = __importDefault(require("form-data"));
var fs_1 = require("fs");
var CONTENT_TYPE_HEADER = "Content-Type";
function containsBinary(payload) {
    var isBinary = false;
    Object.values(payload).map(function (value) {
        if (isBinary)
            return;
        if (value instanceof Buffer || value instanceof fs_1.ReadStream) {
            isBinary = true;
        }
    });
    return isBinary;
}
exports.containsBinary = containsBinary;
var RequestBuilder = /** @class */ (function () {
    function RequestBuilder(url) {
        var _this = this;
        this.init = {};
        this.responseParser = function (response) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, response];
        }); }); };
        this.url = url;
    }
    RequestBuilder.prototype.withMethod = function (method) {
        this.init.method = method;
        return this;
    };
    RequestBuilder.prototype.withConfig = function (config) {
        this.init.agent = config.proxyAgent;
        return this;
    };
    RequestBuilder.prototype.withHeader = function (header, value) {
        var _a;
        this.init.headers = __assign(__assign({}, this.init.headers), (_a = {}, _a[header] = value, _a));
        return this;
    };
    RequestBuilder.prototype.withFormData = function (payload) {
        this.withHeader(CONTENT_TYPE_HEADER, "application/x-www-form-urlencoded");
        this.init.body = query_string_1.default.stringify((0, q_flat_1.flatten)(payload), { encode: false });
        return this;
    };
    RequestBuilder.prototype.withUrlParams = function (payload) {
        this.url += "?" + query_string_1.default.stringify((0, q_flat_1.flatten)(payload), { encode: false });
        return this;
    };
    RequestBuilder.prototype.withMultipartFormData = function (payload) {
        var form = new form_data_1.default();
        Object.keys(payload).forEach(function (key) {
            if (typeof payload[key] === 'object') {
                form.append(key, payload[key].value, payload[key].config);
            }
            else {
                form.append(key, payload[key]);
            }
        });
        this.init.body = form;
        return this;
    };
    RequestBuilder.prototype.withJsonData = function (data) {
        this.withHeader(CONTENT_TYPE_HEADER, "application/json");
        this.init.body = JSON.stringify(data || {});
        return this;
    };
    RequestBuilder.prototype.withAuthorization = function (credentials) {
        this.withHeader("Authorization", "Bearer ".concat(credentials.accessToken));
        return this;
    };
    RequestBuilder.prototype.acceptJson = function () {
        var _this = this;
        this.withHeader("Accept", "application/json");
        this.responseParser = function (response) { return __awaiter(_this, void 0, void 0, function () {
            var content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, response.text()];
                    case 1:
                        content = _a.sent();
                        try {
                            return [2 /*return*/, JSON.parse(content)];
                        }
                        catch (e) {
                            throw Error("Can not parse json response: " + content);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        return this;
    };
    RequestBuilder.prototype.acceptText = function () {
        this.responseParser = function (response) { return response.text(); };
        return this;
    };
    RequestBuilder.prototype.acceptBinary = function () {
        this.responseParser = function (response) {
            return response.buffer()
                .catch(function () { return (response.arrayBuffer()
                .catch(function () { return (response.blob()
                .catch(function () {
                response.text();
            })); })); });
        };
        return this;
    };
    RequestBuilder.prototype.build = function () {
        return [new node_fetch_1.Request(this.url, this.init), this.responseParser];
    };
    return RequestBuilder;
}());
exports.RequestBuilder = RequestBuilder;
/**
 * Executes request with the user credentials applied.
 * Retrieves personal access token and refresh token.
 *
 * @param requestBuilder
 * @param credentialStorage
 * @param config
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function executeRequestAuthorized(requestBuilder, config, credentialStorage) {
    return __awaiter(this, void 0, void 0, function () {
        var credentials, _a, request, transformResponse;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    credentials = credentialStorage.getCredentials();
                    if (!!credentials) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, ImpersonateCredentials_1.default)(config)];
                case 1:
                    credentials = _b.sent();
                    credentialStorage.saveCredentials(credentials);
                    _b.label = 2;
                case 2:
                    _a = requestBuilder
                        .withConfig(config)
                        .withAuthorization(credentials)
                        .build(), request = _a[0], transformResponse = _a[1];
                    return [2 /*return*/, (0, node_fetch_1.default)(request)
                            .then(function (response) { return (0, RefreshIfNeeded_1.default)(request, response, config, credentialStorage); })
                            .then(transformResponse)];
            }
        });
    });
}
exports.default = executeRequestAuthorized;
//# sourceMappingURL=Invoke.js.map