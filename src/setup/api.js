import Vue from 'vue';
import axios from 'axios';
import store from '@/store';

let api = null;

let config = {
    baseURL: process.env.VUE_APP_API_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

const getUrlInfo = async () => {
    try {
        let res = await axios.get('/config/default.json');
        return res.data.VUE_APP_API.URL;
    } catch (err) {
        console.error(err);
        return config.baseURL;
    }
};

const setRequestInterceptor = (api) => {
    api.interceptors.request.use((conf) => {
        return conf;
    }, (err) => {
        return Promise.reject(err);
    });
};

const setResponseInterceptor = (api) => {
    api.interceptors.response.use((response) => {
        if (response.headers.hasOwnProperty('access-token')) {
            sessionStorage.setItem('token', response.headers['access-token']);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.headers['access-token']}`;
        }
        return response;
    }, function (err) {
        return new Promise(() => {
            const error = err.response;
            if (err.response.status === 403 || err.response.status === 401) {
                console.log('Current Error Code: ', err.response.status);
                store.dispatch('auth/logout');
            }
            throw error;
        });
    });
};

export const setApi = async () => {
    config.baseURL = await getUrlInfo();
    const _api = axios.create(config);
    setRequestInterceptor(_api);
    setResponseInterceptor(_api);
    Vue.prototype.$axios = _api;
    api = _api;
};

export const getApi = () => {
    return api;
};
