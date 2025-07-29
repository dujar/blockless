
import axios, { AxiosError } from 'axios';

import type { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios';
const isDevelopment = import.meta.env.DEV;



export interface ServiceOptions {
    retries?: number;
    retryDelay?: number; // in ms
}

// Custom property for retry logic
interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
    'axios-retry'?: {
        retryCount: number;
    };
}

export class BaseApiService {
    protected http: AxiosInstance;

    constructor(baseURL: string = "", private options: ServiceOptions = {}) {
        // if(!baseURL.match(/http/)){
        //     if(isDevelopment){
        //         baseURL="https://api.1inch.dev"+baseURL;
        //     } else {
        //         baseURL="/api"+baseURL;
        //     }
        // }
        baseURL="/api"+baseURL;

        let config:CreateAxiosDefaults = {
            baseURL,
        };
        if(isDevelopment){
            config.headers = {
                // Authorization: `Bearer ${AUTH_ONE_INCH}`,
                "Access-Control-Allow-Origin": "",
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                "accept": "application/json"
            }
        }
        this.http = axios.create(config);

        this.http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            if (isDevelopment) {
                console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, { params: config.params, data: config.data });
            }
            // Add tracing headers here if needed, e.g. OpenTelemetry
            return config;
        });
        
        this.http.interceptors.response.use(
            response => response,
            (error: AxiosError) => {
                if (isDevelopment) {
                    console.error(`[API Error]`, {
                        status: error.response?.status,
                        data: error.response?.data,
                        url: error.config?.url,
                        method: error.config?.method,
                        message: error.message,
                    });
                }
                
                const config = error.config as RetryableAxiosRequestConfig | undefined;
                if (!config) {
                    return Promise.reject(error);
                }

                const { retries = 3, retryDelay = 1000 } = this.options;
                config['axios-retry'] = config['axios-retry'] || { retryCount: 0 };
                
                if (config['axios-retry'].retryCount < retries && this.isRetryable(error)) {
                    config['axios-retry'].retryCount += 1;
                    
                    // Calculate exponential backoff
                    const delay = retryDelay * Math.pow(2, config['axios-retry'].retryCount - 1);
                    
                    if (isDevelopment) {
                        console.log(`Retrying request, attempt ${config['axios-retry'].retryCount}/${retries} in ${delay}ms...`);
                    }

                    return new Promise(resolve => setTimeout(() => resolve(this.http(config)), delay));
                }

                return Promise.reject(error);
            }
        );
    }

    private isRetryable(error: AxiosError): boolean {
        // Retry on network errors or 5xx server errors
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
            return true;
        }

        return (
            !error.response ||
            (error.response.status >= 500 && error.response.status <= 599)
        );
    }
}
