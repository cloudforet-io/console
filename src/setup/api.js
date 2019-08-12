import axios from 'axios';
// import store from '@/store'

export const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    withCredentials: true,
    /*headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }*/
});

//
// api.interceptors.response.use(undefined, function (err) {
//   console.log(process.env.VUE_APP_API_URL);
//   return new Promise(function (resolve, reject) {
//     if (err.status === 403 && err.config && !err.config.__isRetryRequest) {
//     // if you ever get an unauthorized, logout the user
//       console.log('interceptor')
//       store.dispatch('auth/logout')
//     // you can also redirect to /login if needed !
//     }
//     throw err
//   })
// })

api.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use(function (response) {
    debugger;
    return response;
}, function (error) {
    // Do something with response error
    return Promise.reject(error);
});
