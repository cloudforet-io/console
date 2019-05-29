import axios from 'axios'

export const api = (config) => (
  axios.create({
    ...config,
    baseURL: `http://localhost:3000/api/`,
    withCredentials: false,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
)

// usage: api({url: '/user/list', method: 'get'})
