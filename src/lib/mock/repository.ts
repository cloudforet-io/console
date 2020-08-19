/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';
import { get, find } from 'lodash';

const schemas = [
    {
        labels: [
            'AWS',
        ],
        name: 'aws_access_key',
        service_type: 'secret.credentials',
        schema: {
            properties: {
                aws_access_key_id: {
                    title: 'AWS Access Key',
                    type: 'string',
                    minLength: 4,
                },
                region_name: {
                    type: 'string',
                    minLength: 4,
                    examples: [
                        'ap-northeast-2',
                    ],
                    title: 'Region',
                },
                aws_secret_access_key: {
                    type: 'string',
                    minLength: 4,
                    title: 'AWS Secret Key',
                },
            },
            type: 'object',
            required: [
                'aws_access_key_id',
                'aws_secret_access_key',
            ],
        },
        tags: {
            description: 'AWS Access Key',
        },
        repository_info: {
            repository_id: 'repo-af4bba1c1a03',
            name: 'Market Place',
            repository_type: 'remote',
            endpoint: '',
            version: '',
            secret_id: '',
            created_at: null,
        },
        project_id: '',
        domain_id: 'domain-181a3a9c21fb',
        created_at: {
            seconds: '1585908605',
            nanos: 383000000,
        },
    },
    {
        labels: [
            'AWS',
            'Assume Role',
        ],
        name: 'aws_assume_role',
        service_type: 'secret.credentials',
        schema: {
            properties: {
                role_arn: {
                    title: 'Role ARN',
                    type: 'string',
                    minLength: 4,
                },
                aws_access_key_id: {
                    title: 'AWS Access Key',
                    type: 'string',
                    minLength: 4,
                },
                region_name: {
                    type: 'string',
                    minLength: 4,
                    examples: [
                        'ap-northeast-2',
                    ],
                    title: 'Region',
                },
                aws_secret_access_key: {
                    type: 'string',
                    minLength: 4,
                    title: 'AWS Secret Key',
                },
            },
            type: 'object',
            required: [
                'aws_access_key_id',
                'aws_secret_access_key',
                'role_arn',
            ],
        },
        tags: {
            description: 'AWS Assume Role',
        },
        repository_info: {
            repository_id: 'repo-af4bba1c1a03',
            name: 'Market Place',
            repository_type: 'remote',
            endpoint: '',
            version: '',
            secret_id: '',
            created_at: null,
        },
        project_id: '',
        domain_id: 'domain-181a3a9c21fb',
        created_at: {
            seconds: '1585908605',
            nanos: 428000000,
        },
    },
    {
        labels: [
            'Google Cloud',
            'GCP',
        ],
        name: 'google_oauth_client_id',
        service_type: 'secret.credentials',
        schema: {
            properties: {
                type: {
                    type: 'string',
                    minLength: 4,
                    default: 'service_account',
                    title: 'Type',
                },
                client_email: {
                    type: 'string',
                    minLength: 4,
                    exmaples: [
                        '<api-name>api@project-id.iam.gserviceaccount.com',
                    ],
                    title: 'Client Email',
                },
                private_key: {
                    type: 'string',
                    minLength: 4,
                    examples: [
                        '-----BEGIN',
                    ],
                    title: 'Private Key',
                },
                auth_provider_x509_cert_url: {
                    title: 'Auth Provider Cert URL',
                    type: 'string',
                    minLength: 4,
                    default: 'https://www.googleapis.com/oauth2/v1/certs',
                },
                client_id: {
                    type: 'string',
                    minLength: 4,
                    examples: [
                        '10118252.....',
                    ],
                    title: 'Client ID',
                },
                zone: {
                    type: 'string',
                    minLength: 4,
                    examples: [
                        'asia-northeast3',
                    ],
                    title: 'Region',
                },
                token_uri: {
                    title: 'Token URI',
                    type: 'string',
                    minLength: 4,
                    default: 'https://oauth2.googleapis.com/token',
                },
                private_key_id: {
                    type: 'string',
                    minLength: 4,
                    examples: [
                        '771823abcd...',
                    ],
                    title: 'Private Key ID',
                },
                project_id: {
                    title: 'Project ID',
                    type: 'string',
                    minLength: 4,
                    examples: [
                        'project-id',
                    ],
                },
                client_x509_cert_url: {
                    title: 'client_x509_cert_url',
                    type: 'string',
                    minLength: 4,
                    examples: [
                        'https://www.googleapis.com/...',
                    ],
                },
                auth_uri: {
                    default: 'https://acounts.google.com/o/oauth2/auth',
                    title: 'Auth URI',
                    type: 'string',
                    minLength: 4,
                },
            },
            type: 'object',
            required: [
                'type',
                'project_id',
                'private_key_id',
                'private_key',
                'client_email',
                'client_id',
                'auth_uri',
                'token_uri',
                'auth_provider_x509_cert_url',
                'client_x509_cert_url',
            ],
        },
        tags: {
            description: 'Google OAuth Client ID',
        },
        repository_info: {
            repository_id: 'repo-af4bba1c1a03',
            name: 'Market Place',
            repository_type: 'remote',
            endpoint: '',
            version: '',
            secret_id: '',
            created_at: null,
        },
        project_id: '',
        domain_id: 'domain-181a3a9c21fb',
        created_at: {
            seconds: '1585908605',
            nanos: 404000000,
        },
    },
];
export default [
    new MockData('/repository/repository/list', () => makeArrayResults(arrayOf(10, casual._repository), 80)),
    new MockData('/repository/schema/get', (req) => {
        const params: any = JSON.parse(req.data);
        const name: string = get(params, 'name');
        return find(schemas, { name });
    }),
    new MockData('/repository/plugin/list', () => makeArrayResults(arrayOf(10, casual._plugin), 80)),
    new MockData('/repository/plugin/get-versions', () => casual._pluginVersion),
];
