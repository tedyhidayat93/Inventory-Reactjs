import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001"

interface AxiosRequestConfigWithRetry
  extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// ======================
// REQUEST INTERCEPTOR
// ======================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ======================
// RESPONSE INTERCEPTOR
// ======================
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as AxiosRequestConfigWithRetry

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const refreshToken =
          localStorage.getItem("refreshToken")

        if (!refreshToken) {
          throw new Error("No refresh token")
        }

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        )

        const { accessToken } = data

        localStorage.setItem("accessToken", accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
