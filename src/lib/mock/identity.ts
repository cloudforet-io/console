/* eslint-disable camelcase */
import { makeArrayResults, makeTreeResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';
import { get, find } from 'lodash';

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
                    required: [
                        'account_id',
                    ],
                    properties: {
                        account_id: {
                            title: 'Account ID',
                            minLength: 4,
                            type: 'string',
                        },
                    },
                    type: 'object',
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
            external_link_template: 'https://{{data.account_id}}.signin.aws.amazon.com/console',
            color: '#FF9900',
            icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws.svg',
        },
        metadata: {
            view: {
                layouts: {
                    'help:service_account:create': {
                        name: 'Creation Help',
                        type: 'markdown',
                        options: {
                            markdown: {
                                // eslint-disable-next-line max-len
                                en: '### Finding Your AWS Account ID\nYou can find your account ID in the AWS Management Console, or using the AWS CLI or AWS API.\n### Finding your account ID (Console)\nIn the navigation bar, choose **Support**, and then **Support Center**. Your currently signed-in 12-digit account number (ID) appears in the **Support Center** title bar.\n### Finding your account ID (AWS CLI)\nTo view your user ID, account ID, and your user ARN:* [aws sts get-caller-identity](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html)\n### Finding your account ID (AWS API)\nTo view your user ID, account ID, and your user ARN:* [GetCallerIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html)\n### References\n* [AWS Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/console_account-alias.html)',
                            },
                        },
                    },

                },
            },
        },
        created_at: {
            seconds: '1589165566',
            nanos: 858000000,
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
                'google_api_key',
                'google_oauth_client_id',
            ],
        },
        tags: {
            color: '#4285F4',
            icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/google_cloud.svg',
        },
        created_at: {
            seconds: '1589165566',
            nanos: 864000000,
        },
    },
    {
        provider: 'azure',
        name: 'Microsoft Azure',
        template: {
            service_account: {
                schema: {
                    properties: {
                        tenant_id: {
                            minLength: 4,
                            type: 'string',
                            title: 'Tenant ID',
                        },
                        subscription_id: {
                            minLength: 4,
                            type: 'string',
                            title: 'Subscription ID',
                        },
                    },
                    type: 'object',
                    required: [
                        'tenant_id',
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
            color: '#00BCF2',
            icon: 'https://assets-console-cloudone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/azure.svg',
        },
        created_at: {
            seconds: '1589165566',
            nanos: 870000000,
        },
    },
];
let parentId;
let callCount = 0;
const getTreeItems = (id?: string) => {
    if (!id) {
        callCount += 1;
        if (callCount > 5) {
            // eslint-disable-next-line no-param-reassign
            id = `project-${casual.uuid}`;
        }
    }
    parentId = id;

    return makeTreeResults([
        casual._projectTreeItem(),
        casual._projectTreeItem(parentId),
        casual._projectTreeItem(),
        casual._projectTreeItem(),
    ]);
};

export default [
    new MockData('/identity/domain/list', () => (makeArrayResults([DOMAIN_INFO]))),
    new MockData('/identity/service-account/list', () => makeArrayResults(arrayOf(15, casual._serviceAccount), 20)),
    new MockData('/identity/provider/list', () => makeArrayResults(providerList)),
    new MockData('/identity/provider/get', (req) => {
        console.debug(req);
        const params: any = JSON.parse(req.data);
        const provider: any = get(params, 'provider');
        return find(providerList, { provider });
    }),
    new MockData('/identity/user/get', () => USER_INFO),
    new MockData('/identity/domain-owner/get', () => USER_INFO),
    new MockData('/identity/token/issue', () => ({
        access_token: 'asdf.asdf.asdf',
        refresh_token: 'asdf.asdf.asdf',
    })),
    new MockData('/identity/project/tree', () => getTreeItems()),
    new MockData('/identity/project/tree/search', () => [
        `pg-${casual.uuid}`,
        `pg-${casual.uuid}`,
        `pg-${casual.uuid}`,
        `pg-${casual.uuid}`,
        `project-${casual.uuid}`,
    ]),
];
