import { Mixin } from '@/setup/global_util';
export default {
    queryList: [
        { label: 'ID', key: 'user_id' },
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'mobile' },
        { label: 'Group', key: 'group' },
        { label: 'Language', key: 'language', values: ['en', 'ko']},
        // { label: 'Domain ID', key: 'domain_id', ajax: { url: '/identity/domain/list', params: null, method: 'POST' }},
        { 
            label: 'Timezone', key: 'timezone', 
            values: Mixin.methods.getAllTimezones()
        }
    ],
    autokeyList: ['user_id', 'name', 'email']
};
/**
 * type => grpc 기준 (String, Integer, Float, Boolean, Structure, List, Datetime)
 * grpc datetime 표준 spec 따라서 할 것
 *
 *
 */