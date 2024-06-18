// Configurations
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';

export const DETECTION_CONFIGURATION_HANDLERS = {
    keyItemSets: [
        {
            title: 'Properties',
            items: [
                { name: 'name', label: 'Name' },
                { name: 'policy', label: 'Policy' },
                { name: 'data_source', label: 'Data Source' },
                { name: 'recipients', label: 'Recipients' },
                { name: 'is_use', label: 'Use' },
                {
                    name: 'lasted_at',
                    label: 'Last Detected',
                    dataType: 'datetime',
                },
            ],
        }] as KeyItemSet[],
    // TODO: temp code
    valueHandlerMap: {
        name: makeDistinctValueHandler('cost_analysis.AnomalyDetectionConfiguration', 'name', 'string', [{ k: 'name', v: '', o: 'not' }]),
        policy: makeDistinctValueHandler('cost_analysis.AnomalyDetectionConfiguration', 'policy'),
        data_source: makeDistinctValueHandler('cost_analysis.AnomalyDetectionConfiguration', 'data_source'),
        recipients: makeDistinctValueHandler('cost_analysis.AnomalyDetectionConfiguration', 'recipients'),
        is_use: makeDistinctValueHandler('cost_analysis.AnomalyDetectionConfiguration', 'is_use', 'boolean'),
        lasted_at: makeDistinctValueHandler('cost_analysis.AnomalyDetectionConfiguration', 'lasted_at', 'datetime'),
    },
};

// History
export const ANOMALY_DETECTION_MENU = {
    ALL: 'ALL',
    THIS_MONTH: 'THIS_MONTH',
    LAST_MONTH: 'LAST_MONTH',
    CUSTOM: 'CUSTOM',
} as const;

export const ANOMALY_DETECTION_MENU_ITEM_MAP = {
    [ANOMALY_DETECTION_MENU.ALL]: {
        name: ANOMALY_DETECTION_MENU.ALL,
    },
    [ANOMALY_DETECTION_MENU.THIS_MONTH]: {
        name: ANOMALY_DETECTION_MENU.THIS_MONTH,
        include_today: true,
    },
    [ANOMALY_DETECTION_MENU.LAST_MONTH]: {
        name: ANOMALY_DETECTION_MENU.LAST_MONTH,
        include_today: false,
    },
} as const;

// TEMP DATA
export const CONFIG_TEMP_DATA = [
    {
        config_id: 'id1',
        name: '나영의 detection config1',
        policy: '급격한 변화 탐지',
        data_source: 'aws',
        recipients: [
            {
                type: 'WORKSPACE_OWNER',
                cnt: 4,
            },
            {
                type: 'WORKSPACE_MEMBER',
                cnt: 5,
            },
        ],
        is_use: true,
        lasted_at: '2021-09-01 12:00:00',
    },
    {
        config_id: 'id2',
        name: '나영의 detection config2',
        policy: '급격한 변화 탐지',
        data_source: 'google_cloud',
        recipients: [
            {
                type: 'USER',
                cnt: 16,
            },
        ],
        is_use: false,
        lasted_at: '2021-09-01 12:00:00',
    },
    {
        config_id: 'id3',
        name: '나영의 detection config3',
        policy: '급격한 변화 탐지',
        data_source: 'aws',
        recipients: [
            {
                type: 'WORKSPACE_MEMBER',
                cnt: 13,
            },
        ],
        is_use: true,
        lasted_at: '--',
    },
];
