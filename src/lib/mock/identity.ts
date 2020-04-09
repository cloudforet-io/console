/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};

export const USER_INFO = {
    user_id: 'user_test_id',
    user_name: 'testUser',
    language: 'en',
    timezone: 'UTC',
};

const providerList = [
    {
        provider: 'aws',
        name: 'AWS',
        template: {
            service_account: {
                schema: {
                    properties: {
                        account_id: {
                            minLength: 4,
                            type: 'string',
                            title: 'Account ID',
                        },
                    },
                    type: 'object',
                    required: [
                        'account_id',
                    ],
                },
            },
        },
        capability: {
            supported_schema: [
                'aws_access_key',
                'aws_assume_role',
            ],
        },
        tags: {
            color: '#FF9900',
            icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws.svg',
            external_link_template: 'https://{{data.account_id}}.signin.aws.amazon.com/console',
        },
        created_at: {
            seconds: '1585897816',
            nanos: 960000000,
        },
    },
    {
        provider: 'google_cloud',
        name: 'Google Cloud',
        template: {
            service_account: {
                schema: {
                    properties: {
                        sa_name: {
                            minLength: 4,
                            type: 'string',
                            title: 'Service Account',
                        },
                        project_id: {
                            title: 'Project ID',
                            minLength: 4,
                            type: 'string',
                        },
                    },
                    type: 'object',
                    required: [
                        'sa_name',
                        'project_id',
                    ],
                },
            },
        },
        capability: {
            supported_schema: [
                'google_application_credentials',
            ],
        },
        tags: {
            color: '#4285F4',
            icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/google_cloud.svg',
        },
        created_at: {
            seconds: '1585897816',
            nanos: 966000000,
        },
    },
    {
        provider: 'azure',
        name: 'Microsoft Azure',
        template: {
            service_account: {
                schema: {
                    properties: {
                        subscription_id: {
                            title: 'Subscription ID',
                            minLength: 4,
                            type: 'string',
                        },
                    },
                    type: 'object',
                    required: [
                        'subscription_id',
                    ],
                },
            },
        },
        capability: {
            supported_schema: [
                'azure_client_secret',
            ],
        },
        tags: {
            icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/azure.svg',
            color: '#00BCF2',
        },
        created_at: {
            seconds: '1585897816',
            nanos: 972000000,
        },
    },
];

export default [
    new MockData('/identity/domain/list', () => (makeArrayResults([DOMAIN_INFO]))),
    new MockData('/identity/service-account/list', () => makeArrayResults(arrayOf(15, casual._serviceAccount), 20)),
    new MockData('/identity/provider/list', () => makeArrayResults(providerList)),

    new MockData('/identity/user/get', () => USER_INFO),
    new MockData('/identity/domain-owner/get', () => USER_INFO),
    new MockData('/identity/token/issue', () => ({
        access_token: 'asdf.asdf.asdf',
        refresh_token: 'asdf.asdf.asdf',
    })),
];
