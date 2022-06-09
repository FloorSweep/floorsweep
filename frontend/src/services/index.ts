import {HttpConfig, httpFactory} from "./http";
import ApiErrorInterceptor from "./interceptors/api-error.interceptor";
import ApiAuthInterceptor from "./interceptors/api-auth.interceptor";
import {AxiosInstance} from "axios";

class _Http {
  authed: AxiosInstance
  guest: AxiosInstance

  constructor() {
    this.authed = httpFactory(HttpConfig)
    this.guest = httpFactory(HttpConfig)

    this.authed.interceptors.response.use(res => res, ApiErrorInterceptor)
    this.guest.interceptors.response.use(res => res, ApiErrorInterceptor)

    this.authed.interceptors.request.use(ApiAuthInterceptor, error => error)
  }
}

const Http = new _Http()

export {Http}