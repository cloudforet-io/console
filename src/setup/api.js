import axios from 'axios'
// import store from '@/store'

export const api = axios.create({
  baseURL: `http://localhost:3000/api/`,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// api.interceptors.response.use(undefined, function (err) {
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
