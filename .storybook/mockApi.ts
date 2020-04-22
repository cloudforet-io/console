import axios from "axios";
import {setMockData} from "../src/lib/mock";
import {FluentApi, fluentApi} from "../src/lib/fluent-api";

const axiosInstance = axios.create();
setMockData(axiosInstance);

const mockFluentApi = new FluentApi({instance: axiosInstance})
export {
    axiosInstance,
    mockFluentApi
}
