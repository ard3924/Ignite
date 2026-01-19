import axios from "axios"

const axiosInstance = axios.create({
    baseURL:  "http://localhost:5200/api",
    // baseURL:  "/api",

});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



export default axiosInstance;