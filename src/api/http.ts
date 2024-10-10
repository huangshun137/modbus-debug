import { AxiosRequestConfig } from "axios";
import service from "@/utils/request";

type CustomAxiosRequestConfig = AxiosRequestConfig & {
  isLoading?: boolean;
};
const postApi = (url: string, data: any = {}): any =>
  service.post(url, data, { isLoading: true } as CustomAxiosRequestConfig);

const postApiWithoutLoading = (url: string, data: any = {}) =>
  service.post(url, data, { isLoading: false } as CustomAxiosRequestConfig);

const getApi = (url: string, params: any = {}) =>
  service.get(url, { params, isLoading: true } as CustomAxiosRequestConfig);

const getApiWithoutLoading = (url: string, params: any = {}) =>
  service.get(url, { params, isLoading: false } as CustomAxiosRequestConfig);

const deleteApi = (url: string, params: any = {}, config = {}): any =>
  service.delete(url, {
    params,
    isLoading: true,
    ...config,
  } as CustomAxiosRequestConfig);
const deleteApiWithoutLoading = (
  url: string,
  params: any = {},
  config = {}
): any =>
  service.delete(url, {
    params,
    isLoading: false,
    ...config,
  } as CustomAxiosRequestConfig);

export {
  postApi,
  postApiWithoutLoading,
  getApi,
  getApiWithoutLoading,
  deleteApi,
  deleteApiWithoutLoading,
};
