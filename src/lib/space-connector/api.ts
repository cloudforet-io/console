import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig,
} from 'axios';
import jwt from 'jsonwebtoken';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { SessionTimeoutCallback } from './type';

const ACCESS_TOKEN_KEY = 'spaceConnector/accessToken';
const REFRESH_TOKEN_KEY = 'spaceConnector/refreshToken';
const REFRESH_URL = '/identity/token/refresh';

export class APIError extends Error {
    status: number;

    code: string;

    axiosError: AxiosError;

    constructor(axiosError: AxiosError) {
        super();

        this.name = 'APIError';
        this.status = 500;
        this.code = 'ERROR_UNKNOWN';
        this.axiosError = axiosError;

        if (axiosError.response) {
            this.status = axiosError.response.status;

            if (axiosError.response.data.error) {
                this.message = axiosError.response.data.error.message;
                this.code = axiosError.response.data.error.code;
            } else {
                this.message = axiosError.response.statusText;
            }
        } else {
            this.message = axiosError.message;
        }
    }
}

class API {
    instance: AxiosInstance;

    private refreshInstance: AxiosInstance;

    private accessToken?: string;

    private refreshToken?: string;

    private readonly sessionTimeoutCallback: SessionTimeoutCallback;

    private defaultAxiosConfig: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    constructor(baseURL: string, sessionTimeoutCallback: SessionTimeoutCallback) {
        this.sessionTimeoutCallback = sessionTimeoutCallback;

        const axiosConfig = this.getAxiosConfig(baseURL);
        this.instance = axios.create(axiosConfig);
        this.refreshInstance = axios.create(axiosConfig);

        this.loadToken();
        this.setAxiosInterceptors();
    }

    private loadToken(): void {
        const storedAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);

        if (storedAccessToken) this.accessToken = storedAccessToken;
        if (storedRefreshToken) this.refreshToken = storedRefreshToken;
    }

    checkToken(): boolean {
        return (API.getTokenExpirationTime(this.refreshToken) - API.getCurrentTime()) > 10;
    }

    getExpirationTime(): number {
        const expiryTime = API.getTokenExpirationTime(this.refreshToken) - API.getCurrentTime();
        if (expiryTime < 0) return 0;

        return expiryTime;
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
    }

    static getTokenExpirationTime(token?: string): number {
        if (token) {
            try {
                const refreshToken = JSON.parse(token).data;
                const decodedToken = jwt.decode(refreshToken);
                return decodedToken.exp;
            } catch (e) {
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

    private async refreshAuthLogic(failedRequest: any): Promise<any> {
        try {
            const response = await this.refreshInstance.post(REFRESH_URL);
            this.setToken(response.data.access_token, response.data.refresh_token);
            failedRequest.response.config.headers.Authorization = `Bearer ${this.accessToken}`;
            return response;
        } catch (err) {
            this.flushToken();
            this.sessionTimeoutCallback();
            throw err;
        }
    }

    private setAxiosInterceptors(): void {
        // Axios request interceptor to set the access token
        this.instance.interceptors.request.use((request) => {
            request.headers.Authorization = `Bearer ${this.accessToken}`;
            return request;
        });

        // Axios response interceptor with error handling
        this.instance.interceptors.response.use(
            response => response,
            error => Promise.reject(new APIError(error)),
        );

        // Axios request interceptor to set the refresh token
        this.refreshInstance.interceptors.request.use((request) => {
            request.headers.Authorization = `Bearer ${this.refreshToken}`;
            return request;
        });

        // Interceptor for auth refresh
        createAuthRefreshInterceptor(this.instance, this.refreshAuthLogic, { skipWhileRefreshing: false });
    }
}

export default API;
