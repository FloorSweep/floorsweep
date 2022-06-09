import {AxiosError} from "axios";
import {errorToast} from "../../components/Toast/Toast";
import UserNotFoundError from "../exceptions/UserNotFound.error";


const ApiErrorInterceptor = (error: AxiosError) => {
  if (error.response) {
    const status = error.response.status
    if (status === 500) {
      errorToast("500 error")
    } else if (error.response.data && error.response.data.message) {
      if (error.response.data.message === "User not found" && error.response.status === 401) {
        throw new UserNotFoundError()
      } else {
        errorToast(error.response.data.message)
      }
    } else if (status === 400) {
      errorToast("400 error")
    } else if (status === 401) {
      errorToast("401 error")
    }
  } else if (error.request) {
    errorToast("Network error")
  }
  throw error
}

export default ApiErrorInterceptor
