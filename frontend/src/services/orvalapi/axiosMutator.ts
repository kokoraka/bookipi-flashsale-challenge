import Axios, { AxiosRequestConfig, AxiosError } from "axios";
import { Config } from "../../components/Config"

const config = Config()

export const AXIOS_INSTANCE = Axios.create({
  baseURL: config.getString("VITE_API_HOST"),
  /**
   * @note
   * indexes: false  → scopes[]=organization&scopes[]=administration
   * indexes: true   → scopes[0]=organization&scopes[0]=administration
   * indexes: null   → ?scopes=organization&scopes=administration
   */
  paramsSerializer: {
    indexes: null,
  },
});

// Add a second `options` argument to pass extra options to each query
export const axiosMutator = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
  }).then(({ data }) => data);

  return promise;
};

// Override the return error type for react-query and swr
export type ErrorType<Error> = AxiosError<Error>;

// Standard body type
export type BodyType<BodyData> = BodyData;
