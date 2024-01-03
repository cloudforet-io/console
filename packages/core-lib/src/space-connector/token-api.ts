import type {
    AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders,
} from 'axios';
import axios from 'axios';
import type { JwtPayload } from 'jwt-decode';
import jwtDecode from 'jwt-decode';

import { LocalStorageAccessor } from '@/local-storage-accessor';
import type {
    AxiosPostResponse,
    SessionTimeoutCallback,
} from '@/space-connector/type';

const REFRESH_TOKEN_KEY = 'spaceConnector/refreshToken';
const REFRESH_URL = '/identity/token/grant';
const IS_REFRESHING_KEY = 'spaceConnector/isRefreshing';

const VERBOSE = false;

export default class TokenAPI {
    private static instance: TokenAPI;

    static getInstance(baseURL: string, sessionTimeoutCallback: SessionTimeoutCallback) {
        if (!this.instance) {
            this.instance = new TokenAPI(baseURL, sessionTimeoutCallback);
        }
        return this.instance;
    }

    private refreshInstance: AxiosInstance;

    private accessToken?: string|null;

    private refreshToken?: string;

    private readonly sessionTimeoutCallback: SessionTimeoutCallback;

    constructor(baseURL: string, sessionTimeoutCallback: SessionTimeoutCallback) {
        // init refreshing state to avoid passing refreshing process
        TokenAPI.unsetRefreshingState();
        this.sessionTimeoutCallback = sessionTimeoutCallback;

        const axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
            baseURL,
        };
        this.refreshInstance = axios.create(axiosConfig);

        this.loadToken();
        this.setAxiosInterceptors();
    }

    loadToken(): void {
        this.refreshToken = LocalStorageAccessor.getItem(REFRESH_TOKEN_KEY) || undefined;
    }

    flushToken(): void {
        LocalStorageAccessor.removeItem(REFRESH_TOKEN_KEY);
        this.accessToken = undefined;
        this.refreshToken = undefined;
    }

    setToken(accessToken: string, refreshToken?: string): void {
        this.accessToken = accessToken;
        if (refreshToken) {
            this.refreshToken = refreshToken;
            LocalStorageAccessor.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
        TokenAPI.unsetRefreshingState();
    }

    getRefreshToken(): string|undefined|null {
        return this.refreshToken;
    }

    getAccessToken(): string|undefined|null {
        return this.accessToken;
    }

    static checkRefreshingState(): string|null {
        return LocalStorageAccessor.getItem(IS_REFRESHING_KEY);
    }

    static setRefreshingState(): void {
        return LocalStorageAccessor.setItem(IS_REFRESHING_KEY, true);
    }

    static unsetRefreshingState(): void {
        return LocalStorageAccessor.removeItem(IS_REFRESHING_KEY);
    }

    async refreshAccessToken(executeSessionTimeoutCallback = true): Promise<boolean|undefined> {
        if (!this.refreshToken || !this.accessToken) {
            return false;
        }
        if (TokenAPI.checkRefreshingState() !== 'true') {
            try {
                TokenAPI.setRefreshingState();
                const { rol, wid } = jwtDecode<JwtPayload&{rol: string, wid: string}>(this.accessToken);
                let scope = 'USER';
                if (rol === 'SYSTEM_ADMIN') scope = 'SYSTEM';
                if (rol === 'DOMAIN_ADMIN') scope = 'DOMAIN';
                if (rol === 'WORKSPACE_OWNER' || rol === 'WORKSPACE_MEMBER') scope = 'WORKSPACE';

                const response: AxiosPostResponse = await this.refreshInstance.post(REFRESH_URL, {
                    grant_type: 'REFRESH_TOKEN', token: this.refreshToken, scope, workspaceId: wid,
                });
                this.setToken(response.data.access_token);
                if (VERBOSE) {
                    const decoded = jwtDecode<JwtPayload&{ttl: number}>(response.data.refresh_token);
                    console.debug('TokenAPI.refreshAccessToken: success');
                    console.debug(`TokenAPI.refreshAccessToken: new refresh token ttl: ${decoded.ttl}`);
                }
                return true;
            } catch (e) {
                if (VERBOSE) {
                    console.debug('TokenAPI.refreshAccessToken: failed');
                }
                this.flushToken();
                if (executeSessionTimeoutCallback) this.sessionTimeoutCallback();
                return false;
            } finally {
                TokenAPI.unsetRefreshingState();
            }
        } else {
            return true;
        }
    }

    async getActivatedToken() {
        if (this.accessToken && this.refreshToken) {
            const isTokenValid = this.checkToken();
            if (!isTokenValid) await this.refreshAccessToken();
        }
    }

    checkToken(): boolean {
        const currentAccessToken = this.accessToken || undefined;
        const tokenExpirationTime = TokenAPI.getTokenExpirationTime(currentAccessToken);
        const currentTime = TokenAPI.getCurrentTime();
        if (VERBOSE) {
            console.debug(`TokenAPI.checkToken: tokenExpirationTime - currentTime: ${tokenExpirationTime - currentTime}`);
        }
        return (tokenExpirationTime - currentTime) > 300; // initial difference between token expiration time and current time is 300 seconds
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

    private setAxiosInterceptors(): void {
        // Axios request interceptor to set the refresh token
        this.refreshInstance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
            const storedRefreshToken = LocalStorageAccessor.getItem(REFRESH_TOKEN_KEY);
            if (!storedRefreshToken) {
                throw new Error('Session has expired. No stored refresh token.');
            }
            if (!request.headers) request.headers = {} as AxiosRequestHeaders;

            request.headers.Authorization = `Bearer ${storedRefreshToken}`;
            return request;
        });
        this.refreshInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error) => Promise.reject(error),
        );
    }
}
