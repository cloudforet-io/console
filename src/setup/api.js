import axios from 'axios';
import store from '@/store';
import url from 'url';
let isFirstLogin = false;

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
/*
* First login 인가?
* total count 가 0 보다 크냐?
*
*
* */
// Add a response interceptor
api.interceptors.response.use(function (response) {
    debugger;
    if (url.parse(response.config.url).pathname === '/identity/domain/list') {
        if (baseRedirectChecker(response) === 1) {
            store.dispatch('auth/logout');
        } else {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }
    }
    return response;
}, function (error) {
    if (error.status === 403 && error.config && !error.config.__isRetryRequest) {
        //if you ever get an unauthorized, logout the user
        console.log('interceptor');
        store.dispatch('auth/logout');
        // you can also redirect to /login if needed !
    }
    throw error;
});


/*
 * This is special method for Auth Process for interceptors.
 */

function baseRedirectChecker(rep){
    let response = rep.data
    if (response.total_count > 0) {
        let result = response.results[0];
        if (!result.plugin_info ||
            !result.plugin_info.options ||
            !result.plugin_info.options.auth_type ) {
            return 1;
        } else {
            return 2;
        };
    } else {
        throw new Error('Invalid Access to Service');
    }
};