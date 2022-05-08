"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = __importStar(require("node-fetch"));
var url_1 = require("url");
var ErrorHandling_1 = require("./ErrorHandling");
var createOAuthRequestTokenUrl = function (config) {
    var form = new url_1.URLSearchParams();
    form.append("grant_type", "client_credentials");
    form.append("client_id", config.clientId);
    form.append("client_secret", config.clientSecret);
    return new node_fetch_1.Request({
        href: "".concat(process.env.PAXFUL_OAUTH_HOST, "/oauth2/token")
    }, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accepts": "application/json"
        },
        agent: config.proxyAgent,
        body: form
    });
};
/**
 * Retrieves personal access token and refresh token.
 *
 * @param config
 */
function retrievePersonalCredentials(config) {
    return (0, node_fetch_1.default)(createOAuthRequestTokenUrl(config))
        .then((0, ErrorHandling_1.handleErrors)("retrieve personal credentials"))
        .then(function (tokenResponse) {
        return ({
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000))
        });
    });
}
exports.default = retrievePersonalCredentials;
//# sourceMappingURL=PersonalCredentials.js.map