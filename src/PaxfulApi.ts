import { Http2ServerResponse } from "http2";

import { Profile, Credentials, CredentialStorage } from "./oauth";
import { ApiConfiguration } from "./ApiConfiguration";
import { authorize, retrieveImpersonatedCredentials, retrievePersonalCredentials, getProfile, invoke } from "./commands";
import { RequestBuilder } from "./commands/Invoke";

/**
 * Interface responsable for exposing Paxful API integration.
 * @public
 */
export class PaxfulApi {

    private readonly apiConfiguration: ApiConfiguration
    private readonly credentialStorage?: CredentialStorage

    constructor(configuration: ApiConfiguration, credentialStorage?: CredentialStorage) {
        this.apiConfiguration = configuration;
        this.credentialStorage = credentialStorage;
        this.validateAndSetDefaultParameters(configuration);
    }

    /**
     * Redirect the user to authorize the access.
     * @param response
     */
    public login(response: Http2ServerResponse): void {
        return authorize(response, this.apiConfiguration);
    }

    /**
     * Retrieve the tokens with the code generated by {@link PaxfulApi/login}
     * @param code returned by the redirect after user authorizes the application.
     * @return a promise for {@link Credentials}
     */
    public async impersonatedCredentials(code: string): Promise<Credentials> {
        return this.saveToken(
            retrieveImpersonatedCredentials(this.apiConfiguration, code)
        );
    }

    /**
     * Retrieve the tokens for using your own account.
     */
    public async myCredentials(): Promise<Credentials> {
        return this.saveToken(
            retrievePersonalCredentials(this.apiConfiguration)
        );
    }

    /**
     * Get current logged user profile.
     */
    public async getProfile(): Promise<Profile> {
        if(!this.credentialStorage) throw Error("No credentials storage defined.");
        return await getProfile(this.credentialStorage, this.apiConfiguration);
    }

    /**
     * Invokes an API operation on behalf of currently authenticated user.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param payload - (Optional) Payload of the request
     */
    public invoke(url: string, payload?: Record<string, unknown> | []): Promise<any> {
        return invoke((
            new RequestBuilder(`${process.env.PAXFUL_DATA_HOST}${url}`)
                .acceptJson()
                .withMethod("POST")
                .withFormData(payload)
        ), this.apiConfiguration, this.credentialStorage);
    }

    /**
     * Uploads files on behalf of currently authenticated user,
     * assumes that payload contains multipart form data.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param payload - (Optional) Payload of the request
     * @param method - (Optional) Method to use. Default: POST
     */
    public upload(url: string, payload: Record<string, unknown> | [], method="POST"): Promise<any> {
        return invoke((
            new RequestBuilder(`${process.env.PAXFUL_DATA_HOST}${url}`)
                .acceptJson()
                .withMethod(method)
                .withMultipartFormData(payload)
        ), this.apiConfiguration, this.credentialStorage);
    }

    /**
     * Downloads file on behalf of currently authenticated user,
     * assumes that response will be binary file.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param method - (Optional) Method to use. Default: POST
     */
    public download(url: string, method="GET"): Promise<any> {
        return invoke((
            new RequestBuilder(`${process.env.PAXFUL_DATA_HOST}${url}`)
                .acceptBinary()
                .withMethod(method)
        ), this.apiConfiguration, this.credentialStorage);
    }

    /**
     * Invokes a GET API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     */
    public get(url: string): Promise<any> {
        return invoke((
            new RequestBuilder(`${process.env.PAXFUL_DATA_HOST}${url}`)
                .acceptJson()
                .withMethod("GET")
        ), this.apiConfiguration, this.credentialStorage);
    }

    /**
     * Invokes a POST API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param json - (Optional) any json data
     */
    public post(url: string, json?: Record<string, any>): Promise<any> {
        return this.invokeJsonMethod(url,"POST", json)
    }

    /**
     * Invokes a DELETE API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param json - (Optional) any json data
     */
    public delete(url: string, json?: Record<string, any>): Promise<any> {
        return this.invokeJsonMethod(url,"DELETE", json)
    }

    /**
     * Invokes a PUT API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param json - (Optional) any json data
     */
    public put(url: string, json?: Record<string, any>): Promise<any> {
        return this.invokeJsonMethod(url,"PUT", json)
    }

    /**
     * Invokes a PATCH API operation on behalf of currently authenticated user.
     * Will parse response as json.
     *
     * @param url - Url that should be called at api.paxful.com
     * @param json - (Optional) any json data
     */
    public patch(url: string, json?: Record<string, any>): Promise<any> {
        return this.invokeJsonMethod(url,"PATCH", json)
    }

    protected invokeJsonMethod(url: string, method: string, json?: Record<string, any>): Promise<any> {
        return invoke((
            new RequestBuilder(`${process.env.PAXFUL_DATA_HOST}${url}`)
                .acceptJson()
                .withMethod(method)
                .withJsonData(json)
        ), this.apiConfiguration, this.credentialStorage);
    }

    private validateAndSetDefaultParameters(configuration: ApiConfiguration) {
        const defaultOAuthHost = "https://accounts.paxful.com";
        const defaultDataHost = "https://api.paxful.com";
        if (!configuration.scope || configuration.scope.length === 0) {
            this.apiConfiguration.scope = ["profile", "email"];
        }
        if (process.env.PAXFUL_OAUTH_HOST === "") {
            process.env.PAXFUL_OAUTH_HOST = defaultOAuthHost;
        } else {
            process.env.PAXFUL_OAUTH_HOST = process.env.PAXFUL_OAUTH_HOST ?? defaultOAuthHost;
        }
        if (process.env.PAXFUL_DATA_HOST === "" || !process.env.PAXFUL_DATA_HOST) {
            process.env.PAXFUL_DATA_HOST = defaultDataHost;
        } else {
            process.env.PAXFUL_DATA_HOST = process.env.PAXFUL_DATA_HOST ?? defaultDataHost;
        }
    }

    private async saveToken(credentialsPromise: Promise<Credentials>): Promise<Credentials> {
        if(this.credentialStorage) {
            this.credentialStorage.saveCredentials(await credentialsPromise);
        }
        return credentialsPromise;
    }
}
