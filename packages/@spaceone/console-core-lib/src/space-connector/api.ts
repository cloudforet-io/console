import type {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import axios from 'axios';
import type { JwtPayload } from 'jwt-decode';
import jwtDecode from 'jwt-decode';

import {
    APIError, AuthenticationError,
    AuthorizationError, BadRequestError,
    NotFoundError,
} from '@/space-connector/error';
import type {
    AxiosPostResponse,
    SessionTimeoutCallback,
} from '@/space-connector/type';

const ACCESS_TOKEN_KEY = 'spaceConnector/accessToken';
const REFRESH_TOKEN_KEY = 'spaceConnector/refreshToken';
const REFRESH_URL = '/identity/token/refresh';
const IS_REFRESHING_KEY = 'spaceConnector/isRefreshing';
class API {
    instance: AxiosInstance;

    private refreshInstance: AxiosInstance;

    private accessToken?: string|null;

    private refreshToken?: string;

    private readonly sessionTimeoutCallback: SessionTimeoutCallback;

    private defaultAxiosConfig: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    constructor(baseURL: string, sessionTimeoutCallback: SessionTimeoutCallback) {
        this.sessionTimeoutCallback = sessionTimeoutCallback;

        const axiosConfig = this.getAxiosConfig(baseURL);
        this.instance = axios.create(axiosConfig);
        this.refreshInstance = axios.create(axiosConfig);

        this.loadToken();
        this.setAxiosInterceptors();
    }

    private loadToken(): void {
        this.accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
        this.refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
    }

    flushToken(): void {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        this.accessToken = undefined;
        this.refreshToken = undefined;
    }

    setToken(accessToken: string, refreshToken: string): void {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        API.unsetRefreshingState();
    }

    getRefreshToken(): string|undefined {
        return this.refreshToken;
    }

    static checkRefreshingState(): string|null {
        return window.localStorage.getItem(IS_REFRESHING_KEY);
    }

    static setRefreshingState(): void {
        return window.localStorage.setItem(IS_REFRESHING_KEY, 'true');
    }

    static unsetRefreshingState(): void {
        return window.localStorage.removeItem(IS_REFRESHING_KEY);
    }

    async refreshAccessToken(executeSessionTimeoutCallback = true): Promise<boolean|undefined> {
        if (API.checkRefreshingState() !== 'true') {
            try {
                API.setRefreshingState();
                const response: AxiosPostResponse = await this.refreshInstance.post(REFRESH_URL);
                this.setToken(response.data.access_token, response.data.refresh_token);
                return true;
            } catch (e) {
                console.error('[API][refreshAccessToken] token refresh failed! error: ', e);
                this.flushToken();
                if (executeSessionTimeoutCallback) this.sessionTimeoutCallback();
                return false;
            }
        } else {
            return undefined;
        }
    }

    async getActivatedToken() {
        if (this.accessToken) {
            const isTokenValid = API.checkToken();
            if (isTokenValid) this.accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
            else await this.refreshAccessToken();
        }
    }

    static checkToken(): boolean {
        const storedAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
        const tokenExpirationTime = API.getTokenExpirationTime(storedAccessToken);
        const currentTime = API.getCurrentTime();
        return (tokenExpirationTime - currentTime) > 10;
    }

    static getTokenExpirationTime(token?: string): number {
        if (token) {
            try {
                const decodedToken = jwtDecode<JwtPayload>(token);
                return decodedToken.exp ?? -1;
            } catch (e) {
                console.error(`Decode token error: ${e}`);
                return -1;
            }
        } else {
            return -1;
        }
    }

    static getCurrentTime(): number {
        return Math.floor(Date.now() / 1000);
    }

    private getAxiosConfig(baseURL: string): AxiosRequestConfig {
        if (baseURL) {
            this.defaultAxiosConfig.baseURL = baseURL;
        }

        return this.defaultAxiosConfig;
    }

    private handleRequestError = (error: AxiosError) => {
        switch (error.response?.status) {
        case 400: {
            throw new BadRequestError(error);
        }
        case 401: {
            const res = this.refreshAccessToken();
            if (!res) throw new AuthenticationError(error);
            else break;
        }
        case 403: {
            throw new AuthorizationError(error);
        }
        case 404: {
            throw new NotFoundError(error);
        }
        default: {
            throw new APIError(error);
        }
        }
    }

    private setAxiosInterceptors(): void {
        // Axios request interceptor
        this.instance.interceptors.request.use((request: AxiosRequestConfig) => {
            if (!request.headers) request.headers = {};

            // Set the access token
            const storedAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
            request.headers.Authorization = `Bearer ${storedAccessToken}`;

            return request;
        });

        // Axios request interceptor to set the refresh token
        this.refreshInstance.interceptors.request.use((request) => {
            const storedRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
            if (!storedRefreshToken) {
                throw new Error('Session has expired. No stored refresh token.');
            }
            if (!request.headers) request.headers = {};

            request.headers.Authorization = `Bearer ${storedRefreshToken}`;
            return request;
        });
        this.refreshInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error) => {
                console.error('[API][refreshInstance interceptors] response error occurred! error: ', error);
                return Promise.reject(error);
            },
        );

        // Axios's response interceptor with error handling
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            error => Promise.reject(this.handleRequestError(error)),
        );
    }
}

export default API;
