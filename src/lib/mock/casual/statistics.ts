/* eslint-disable camelcase */
import { ModelType } from '@/lib/mock/casual/type';
import _ from 'lodash';
import { ResourceDiffModel, ResourceUpdateType } from '@/lib/fluent-api/statistics/type';

const resourceDiff: ModelType = (casual) => {
    casual.define('resourceDiff', (): ResourceDiffModel => ({
        provider: casual.last_name,
        group: casual.word,
        name: casual.random_element([casual.word, undefined]),
        tags: {
            icon: casual.random_element([casual.defaultImg(), undefined]),
        },
        update_type: casual.random_element(_.map(ResourceUpdateType, v => v)),
        count: casual.integer(0),
    }));
    return casual;
};

export interface StatisticsCasual {
    resourceDiff?: any;
    _resourceDiff?: any;
}

const result: ModelType[] = [
    resourceDiff,
];

export default result;
