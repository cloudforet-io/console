/* eslint-disable camelcase */
import { select, boolean, text } from '@storybook/addon-knobs';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PDynamicView from './DynamicView.vue';
import md from './DynamicView.md';
import { MockSubDataAPI } from '@/lib/api';

export default {
    title: 'organisms/dynamic-view/dynamic-view',
    component: PDynamicView,
    parameters: {
        notes: md,
    },
};

const data = {
    table_name: 'TableA',
    ItemCount: 10,
    TableStatus: 'ACTIVE',
    TableArn: 'arn:aws:dynamodb:ap-northeast-2:072548720675:table/cloudone-terraform-table',
    TableId: 'b82487c6-6980-4b51-86d4-cef2497613e7',
    ProvisionedThroughput: { NumberOfDecreasesToday: 0, ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    GlobalSecondaryIndexes: [
        {
            IndexName: 'add-pk-index',
            KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            IndexStatus: 'ACTIVE',
            ProvisionedThroughput: {
                NumberOfDecreasesToday: 1, ReadCapacityUnits: 5, WriteCapacityUnits: 5,
            },
            IndexSizeBytes: 0,
            ItemCount: 0,
            IndexArn: 'arn:aws:dynamodb:ap-northeast-2:072548720675:table/test_table/index/add-pk-index',
        },
    ],
};


export const defaultCase = () => ({
    components: { PDynamicView },
    template: '<div style="width: 80vw"><PDynamicView view_type="item" name="Dynamic Item" :data_source="data_source" :data="data"/></div>',
    setup() {
        return {
            data_source: [
                {
                    name: 'table_name',
                    key: 'data.table_name',
                },
                {
                    name: 'TableArn',
                    key: 'data.TableArn',
                },
                {
                    name: 'Read capacity units',
                    key: 'data.ProvisionedThroughput.ReadCapacityUnits',
                },
                {
                    name: 'Write capacity units',
                    key: 'data.ProvisionedThroughput.WriteCapacityUnits',
                },
                {
                    name: 'TableStatus',
                    key: 'data.TableStatus',
                    view_type: 'enum',
                    view_option: {
                        DEACTIVE: {
                            view_option: {
                                text_color: '#FF7750',
                                icon: {
                                    image: 'aws-ec2',
                                    color: '#FF7750',
                                },
                            },
                            view_type: 'state',
                        },
                        ACTIVE: {
                            view_option: {
                                text_color: '#60B731',
                                icon: {
                                    image: 'aws-ec2',
                                    color: '#60B731',
                                },
                            },
                            view_type: 'state',
                        },

                    },
                },
            ],
            data,
        };
    },
});
const subData = [
    {
        IndexName: 'add-pk-index-1',
        Projection: { ProjectionType: 'ALL' },
        IndexStatus: 'ACTIVE',
        ProvisionedThroughput: {
            NumberOfDecreasesToday: 1, ReadCapacityUnits: 5, WriteCapacityUnits: 5,
        },
        ItemCount: 0,
    },
    {
        IndexName: 'add-pk-index-2',
        KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'Half' },
        IndexStatus: 'ACTIVE',
        ProvisionedThroughput: {
            NumberOfDecreasesToday: 1, ReadCapacityUnits: 9, WriteCapacityUnits: 5,
        },
        ItemCount: 10,
    },
    {
        IndexName: 'add-pk-index-3',
        KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        IndexStatus: 'DEACTIVATE',
        ProvisionedThroughput: {
            NumberOfDecreasesToday: 1, ReadCapacityUnits: 15, WriteCapacityUnits: 2,
        },
        ItemCount: 300,
    },
    {
        IndexName: 'add-pk-index-4',
        KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'KEY_ONLY' },
        IndexStatus: 'ACTIVE',
        ProvisionedThroughput: {
            NumberOfDecreasesToday: 1, ReadCapacityUnits: 3, WriteCapacityUnits: 1,
        },
        ItemCount: 1000,
    },
];

export const tableType = () => ({
    components: { PDynamicView },
    template: '<div style="width: 80vw"><PDynamicView view_type="table" :data_source="data_source" :apiHandler="apiHandler" :data="null"/></div>',
    setup(props, { parent }) {
        return {
            apiHandler: new MockSubDataAPI(subData),
            data_source: [
                {
                    name: 'Index Name',
                    key: 'IndexName',
                },
                {
                    name: 'Projection Type',
                    key: 'Projection.ProjectionType',
                },
                {
                    name: 'Item Count',
                    key: 'ItemCount',
                },
                {
                    name: 'status',
                    key: 'IndexStatus',
                    view_type: 'enum',
                    view_option: {
                        DEACTIVE: {
                            view_option: {
                                text_color: '#FF7750',
                                icon: {
                                    image: 'aws-ec2',
                                    color: '#FF7750',
                                },
                            },
                            view_type: 'state',
                        },
                        ACTIVE: {
                            view_option: {
                                text_color: '#60B731',
                                icon: {
                                    image: 'aws-ec2',
                                    color: '#60B731',
                                },
                            },
                            view_type: 'state',
                        },

                    },
                },
                {
                    name: 'Write capacity units',
                    key: 'ProvisionedThroughput.WriteCapacityUnits',
                },
                {
                    name: 'Read capacity units',
                    key: 'ProvisionedThroughput.ReadCapacityUnits',
                },
            ],

        };
    },
});
