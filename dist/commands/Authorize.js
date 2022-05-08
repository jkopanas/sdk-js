"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("url");
var createOAuthAuthorizeUrl = function (clientId, redirectUri, requestedScope) {
    var scope = requestedScope ? requestedScope.join(" ") : "";
    var url = new url_1.URL("".concat(process.env.PAXFUL_OAUTH_HOST, "/oauth2/authorize"));
    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", clientId);
    url.searchParams.append("redirect_uri", redirectUri);
    url.searchParams.append("scope", scope);
    return url.href;
};
/**
 * Redirects the user for the authorization flow.
 *
 * @param response
 * @param config
 */
function authorize(response, config) {
    if (!config.redirectUri) {
        throw new Error("Redirect uri is needed for authorization flow.");
    }
    response.statusCode = 302;
    response.writeHead(302, {
        Location: createOAuthAuthorizeUrl(config.clientId, config.redirectUri, config.scope)
    });
    response.end();
}
exports.default = authorize;
//# sourceMappingURL=Authorize.js.map