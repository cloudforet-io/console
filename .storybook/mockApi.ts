import axios from "axios";
import {setMockData} from "../src/lib/mock";
import { fluentApi} from "../src/lib/fluent-api";

const axiosInstance = axios.create();

setMockData(axiosInstance);
fluentApi.api = {instance: axiosInstance}
export {
    axiosInstance,
}
