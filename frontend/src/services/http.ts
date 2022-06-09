import axios, { AxiosRequestConfig } from "axios";
import env from "../environment";
import { isDev } from "../environment/helpers";

const HttpConfig: AxiosRequestConfig = {};

if (isDev()) {
  if (!!env.api.proxyURL) {
    HttpConfig.baseURL = env.api.proxyURL;
    HttpConfig.headers = {
      "x-api-proxy-dst-host": env.api.baseURL,
    };
  } else {
    HttpConfig.baseURL = env.api.baseURL;
  }
} else {
  HttpConfig.baseURL = env.api.baseURL;
}

const httpFactory = (HttpConfig: AxiosRequestConfig) => {
  return axios.create(HttpConfig);
};

export { httpFactory, HttpConfig };
