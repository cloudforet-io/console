import axios from 'axios';
// import store from '@/store'

export const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
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
// let token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXQiOiJBUEkiLCJ2ZXIiOiIyMDE5LTAzLTE4Iiwia2V5IjoiNTZiYzlkZmQxNjdmNDExN2JmNTRlODUxZTc1ZWRhNDIiLCJkaWQiOiJkb21haW4tYjFhYzA1YmZjYzM4In0.GxQHRPRxdWa1wgGj6_hYx7ffOXDRLqkXro33OcftzTK8bzqe0DCczP4asXadpj3Wf5NRdk0miB_h0J-2u_ThCHRfW1dv1RVej3bNI6mffHU1syazexOoscqVkxLOzPVZeqHVIFBgaSjztDONv1zZQoYjsaKJscgZ-JOGLHivE7MKnPbdKu6RXLoLVk6gAx8jaYuquTGisd_x6qqEugLX2Ru8z0skMlY4_Hfr2gVaGLXk7ILvJRUPl9zYX2lXMZwk_I_d2Iwls18Y1JMNN6ZHDe0ky8Gj9HbVuWh3bWbNif3edUIyU0kUf7uJtfbui2BTBjYbyZHVu2LottZkcG0ahw';
// api.interceptors.request.use((config) => {
//     config.headers.Authorization = `Bearer ${token}`;

//     return config;
// });