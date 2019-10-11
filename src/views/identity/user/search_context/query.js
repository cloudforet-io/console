import { Mixin } from '@/setup/global_util';
import { GlobalEnum } from '@/setup/enum';
export default {
    queryList: [
        { label: 'ID', key: 'user_id' },
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'mobile' },
        { label: 'Group', key: 'group' },
        { label: 'Language', key: 'language', values: Object.keys(GlobalEnum.LANGUAGES) },
        { 
            label: 'Timezone', key: 'timezone', 
            values: Mixin.methods.getAllTimezones()
        }
        // { label: 'test', key: 'name', ajax: {
        //     url: '/identity/user/list',
        //     method: 'post',
        //     filter (res) {
        //         return res.data.results.map((user) => {
        //             return user.name;
        //         });
        //     }

        // }}
    ],
    autokeyList: ['user_id', 'name', 'email']
};
/**
 * type => grpc 기준 (String, Integer, Float, Boolean, Structure, List, Datetime)
 * grpc datetime 표준 spec 따라서 할 것
 *
 *
 */
