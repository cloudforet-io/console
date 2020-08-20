import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig,
} from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { SessionTimeoutCallback } from './type';

const REFRESH_URL = '/identity/token/refresh';

class APIError extends Error {
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

    private readonly userStore: any

    private readonly sessionTimeoutCallback: SessionTimeoutCallback;

    private defaultAxiosConfig: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    constructor(baseURL: string, sessionTimeoutCallback: SessionTimeoutCallback, userStore: any) {
        this.userStore = userStore;
        this.sessionTimeoutCallback = sessionTimeoutCallback;

        const axiosConfig = this.getAxiosConfig(baseURL);
        this.instance = axios.create(axiosConfig);
        this.refreshInstance = axios.create(axiosConfig);

        this.setAxiosInterceptors();
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
            this.userStore.setToken(response.data.refresh_token, response.data.access_token);
            failedRequest.response.config.headers.Authorization = `Bearer ${this.userStore.state.accessToken}`;
            return response;
        } catch (err) {
            this.sessionTimeoutCallback();
            throw err;
        }
    }

    private setAxiosInterceptors(): void {
        // Axios request interceptor to set the access token
        this.instance.interceptors.request.use((request) => {
            if (this.userStore.state.isSignedIn) {
                request.headers.Authorization = `Bearer ${this.userStore.state.accessToken}`;
            }
            return request;
        });

        // Axios response interceptor with error handling
        this.instance.interceptors.response.use(
            response => response,
            error => Promise.reject(new APIError(error)),
        );

        // Axios request interceptor to set the refresh token
        this.refreshInstance.interceptors.request.use((request) => {
            if (this.userStore.state.isSignedIn) {
                request.headers.Authorization = `Bearer ${this.userStore.state.refreshToken}`;
            }
            return request;
        });

        // Interceptor for auth refresh
        createAuthRefreshInterceptor(this.instance, this.refreshAuthLogic, { skipWhileRefreshing: false });
    }
}

export default API;
