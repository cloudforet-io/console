import axios from 'axios';
import store from '@/store';
import router from '@/routes/index';

export const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(function (config) {
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use(function (response) {
    //router.push('/error-page');
    //store.dispatch('auth/setNextPath', { nextPath: '/error-page'});
    if (response.headers.hasOwnProperty("AccessToken")) {
        sessionStorage.setItem('token', response.headers.AccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.headers.AccessToken}`;
    }
    return response;
}, function (err) {
    return new Promise(function (resolve, reject) {
        const error = err.response;
        if (error.status === 403  /*&& error.config && !error.config.__isRetryRequest*/ || error.status === 401) {
            console.log('Current Error Code: ', error.status);
            store.dispatch('auth/logout');
        }
        throw error;
    });
});

