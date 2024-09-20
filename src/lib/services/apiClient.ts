import axios, { AxiosError, type AxiosInstance } from 'axios'
import { getAccessTokenFromLocalStorage } from './utils/Token'
import { getLocationURL } from '../../utils/utils'

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `http://${getLocationURL()}:6060/api/v1`,
  headers: {
    Authorization: `Bearer ${getAccessTokenFromLocalStorage()}`,
  },
})

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response, // Let the response go through if it's successful
  (error: AxiosError) => {
    // Centralized error handling

    if (error.response && error.response.data) {
      // Extract and throw the backend error message
      return Promise.reject(new Error(error.response.data || 'Unknown error occurred'))
    }
    return Promise.reject(new Error(error.message || 'Something went wrong'))
  },
)

export default apiClient
