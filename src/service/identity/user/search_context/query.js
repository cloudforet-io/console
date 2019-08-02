export default {
  queryList: [
    { label: 'ID', key: 'user_id', values: ['wanz91', 'johny8989']},
    { label: 'Name', key: 'user_name', values: ['Wanjin', 'John']},
    { label: 'Number', key: 'number', type: 'Number' },
    { label: 'Boolean', key: 'boolean', type: 'Boolean' },
    { label: 'Datetime', key: 'datetime', type: 'Datetime' },
    { label: 'Datetime LongLongLongLongLongLongLongLong', key: 'datetime_long', type: 'Datetime' },
    { label: 'Language', key: 'language', values: ['ko', 'en']},
    { label: 'Domain ID', key: 'domain_id', ajax: { url: '/identity/users', params: null, method: 'GET' }},
    { label: 'Data', key: 'data', type: 'SubKey' },
    { label: 'Test2', key: 'test2' },
    { label: 'Test10', key: 'test10' }
  ],
  autokeyList: ['domain_id', 'name', 'plugin_id']
};
/**
 * type => grpc 기준 (String, Integer, Float, Boolean, Structure, List, Datetime)
 * grpc datetime 표준 spec 따라서 할 것
 *
 *
 */
