/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';
import _ from 'lodash';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};


export default [
    new MockData('/inventory/server/list', () => makeArrayResults(arrayOf(15, casual._server), 80)),
    new MockData(RegExp('.*?/.*?/member/list'), () => makeArrayResults(arrayOf(5, casual._member), 35)),
    new MockData('/inventory/collector/list', (req) => {
        const params: any = JSON.parse(req.data);
        const filter: any = _.get(params, 'query.filter');
        if (filter) {
            const res: any[] = [];
            _.map(filter, (f) => {
                const key = f.k || f.key;
                let values: any = f.v || f.value;
                if (typeof values === 'string') values = [values];
                _.map(values, (v) => {
                    res.push(casual._collector({ [key]: v }));
                });
            });
            return makeArrayResults(res, res.length);
        }
        return makeArrayResults(arrayOf(15, casual._collector), 80);
    }),
];
