export default {
    queryList: [
        { label: 'ID', key: 'user_id' },
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'mobile' },
        { label: 'Group', key: 'group' },
        { label: 'Language', key: 'language', values: ['ko', 'en']},
        { label: 'Domain ID', key: 'domain_id', ajax: { url: '/identity/domain/list', params: null, method: 'POST' }},
        { label: 'Timezone', key: 'timezone', values: ['utc+0']}
    ],
    autokeyList: ['user_id', 'name', 'domain_id']
};
/**
 * type => grpc 기준 (String, Integer, Float, Boolean, Structure, List, Datetime)
 * grpc datetime 표준 spec 따라서 할 것
 *
 *
 */
