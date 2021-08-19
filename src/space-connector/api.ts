import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig
} from 'axios';
import jwt from 'jsonwebtoken';
import { MockInfo, SessionTimeoutCallback } from '@src/space-connector/type';

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

const setMockMode = (request: AxiosRequestConfig, mockEndpoint?: string) => {
    if (mockEndpoint) request.baseURL = mockEndpoint;
};

class API {
    instance: AxiosInstance;

    private refreshInstance: AxiosInstance;

    private accessToken?: string;

    private refreshToken?: string;

    private readonly sessionTimeoutCallback: SessionTimeoutCallback;

    private defaultAxiosConfig: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    private mockInfo: MockInfo = {};

    constructor(baseURL: string, sessionTimeoutCallback: SessionTimeoutCallback, mockInfo: MockInfo) {
        this.sessionTimeoutCallback = sessionTimeoutCallback;
        this.mockInfo = mockInfo;

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
    }

    getRefreshToken(): string|undefined {
        return this.refreshToken;
    }

    async refreshAccessToken(executeSessionTimeoutCallback: boolean = true): Promise<boolean> {
        try {
            const response = await this.refreshInstance.post(REFRESH_URL);
            this.setToken(response.data.access_token, response.data.refresh_token);
            return true;
        } catch (e) {
            this.flushToken();
            if (executeSessionTimeoutCallback) {
                this.sessionTimeoutCallback();
                throw new Error('Failed to refresh token');
            }
            return false;
        }
    }

    async getActivatedToken() {
        if (this.accessToken) {
            const isTokenValid = API.checkToken();
            if (!isTokenValid) {
                await this.refreshAccessToken();
            }
        }
    }

    static checkToken(): boolean {
        const storedAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
        return (API.getTokenExpirationTime(storedAccessToken) - API.getCurrentTime()) > 60;
    }

    static getExpirationTime(): number {
        const storedAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
        const expirationTime = API.getTokenExpirationTime(storedAccessToken) - API.getCurrentTime();
        if (expirationTime < 0) return 0;
        return expirationTime;
    }

    static getTokenExpirationTime(token?: string): number {
        if (token) {
            try {
                const decodedToken = jwt.decode(token);
                return decodedToken.exp;
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

        if (this.mockInfo.all) {
            setMockMode(this.defaultAxiosConfig, this.mockInfo.endpoint);
        }

        return this.defaultAxiosConfig;
    }

    private setAxiosInterceptors(): void {
        // Axios request interceptor
        this.instance.interceptors.request.use((request) => {
            // Set the access token
            request.headers.Authorization = `Bearer ${this.accessToken}`;

            // Set mock mode
            if (request.headers.MOCK_MODE) {
                setMockMode(request, this.mockInfo.endpoint);
            }

            return request;
        });

        // Axios request interceptor to set the refresh token
        this.refreshInstance.interceptors.request.use((request) => {
            const storedRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
            if (!storedRefreshToken) {
                throw new Error('Session has expired.');
            }
            request.headers.Authorization = `Bearer ${storedRefreshToken}`;
            return request;
        });

        // Axios response interceptor with error handling
        this.instance.interceptors.response.use(
            (response) => response,
            (error) => Promise.reject(new APIError(error))
        );
    }
}

export default API;
