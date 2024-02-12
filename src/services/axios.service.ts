import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class AxiosService {
    private readonly axiosInstance = axios.create({});

    public async get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
        return await this.axiosInstance.get<T, R, D>(url, config);
    }
}