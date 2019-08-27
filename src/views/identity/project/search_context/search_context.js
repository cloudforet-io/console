import { Mixin } from '@/setup/global_util';
import { GlobalEnum } from '@/setup/enum';
export default {
    queryList: [],
    autokeyList: ['user_id', 'name', 'email']
};
/**
 * type => grpc 기준 (String, Integer, Float, Boolean, Structure, List, Datetime)
 * grpc datetime 표준 spec 따라서 할 것
 *
 *
 */
