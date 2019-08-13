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
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use(function (response) {
    /*router.app.$router.push('/error-page');
    store.dispatch('auth/setNextPath', { nextPath: '/error-page'});*/

    return response;
}, function (error) {

    return new Promise(function (resolve, reject) {
        if (error.status === 403 && error.config && !error.config.__isRetryRequest) {
            // if you ever get an unauthorized, logout the user
            console.log('axios intercepted');
            store.dispatch('auth/logout');
            // you can also redirect to /login if needed !
        }
        throw error;
    });
});

