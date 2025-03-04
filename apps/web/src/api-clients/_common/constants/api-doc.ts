/**
 * 🚀 AUTO-GENERATED API DOCUMENTATION
 *
 * This file is **automatically generated** by the API documentation script.
 * **DO NOT** modify this file manually, as changes will be overwritten.
 *
 * ## Purpose:
 * - Provides a structured mapping of API endpoints based on the directory structure.
 * - Used for **query key generation**, **caching strategies**, and **API reference**.
 * - Helps maintain consistency and prevents hardcoded API keys.
 *
 * ## How It Works:
 * - The script scans the `api-clients/{service-name}/{resource-name}/schema/api-verbs/` directory.
 * - Extracts `{service-name}`, `{resource-name}`, and `{verb}.ts` files.
 * - Generates a structured **API_DOC** constant.
 *
 * ## Regenerate:
 * If you need to update this file, run:
 *
 * ```sh
 * npm run api-doc
 * ```
 *
 * 🚨 Any manual modifications will be lost on regeneration!
 */

export const API_DOC = {
    'cost-analysis': {
        budget: [
            'create',
            'delete',
            'get',
            'list',
            'set-notification',
            'update',
        ],
        'budget-usage': [
            'analyze',
            'list',
        ],
        cost: [
            'analyze',
            'stat',
        ],
        'cost-query-set': [
            'create',
            'delete',
            'list',
            'update',
        ],
        'cost-report': [
            'get-url',
            'get',
            'list',
            'send',
        ],
        'cost-report-config': [
            'list',
            'update-recipients',
            'update',
        ],
        'cost-report-data': [
            'analyze',
            'list',
        ],
        'data-source': [
            'get',
            'list',
            'sync',
            'update-permissions',
        ],
        'data-source-account': [
            'analyze',
            'list',
            'reset',
            'update',
        ],
        job: [
            'cancel',
            'list',
        ],
        'unified-cost': [
            'analyze',
            'get',
            'list',
            'stat',
        ],
    },
    dashboard: {
        'private-dashboard': [
            'change-folder',
            'create',
            'delete',
            'get',
            'list',
            'update',
        ],
        'private-data-table': [
            'add',
            'delete',
            'get',
            'list',
            'load',
            'transform',
            'update',
        ],
        'private-folder': [
            'create',
            'delete',
            'get',
            'list',
            'update',
        ],
        'private-widget': [
            'create',
            'delete',
            'get',
            'list',
            'load-sum',
            'load',
            'update',
        ],
        'public-dashboard': [
            'change-folder',
            'create',
            'delete',
            'get',
            'list',
            'share',
            'unshare',
            'update',
        ],
        'public-data-table': [
            'add',
            'delete',
            'get',
            'list',
            'load',
            'transform',
            'update',
        ],
        'public-folder': [
            'create',
            'delete',
            'get',
            'list',
            'share',
            'unshare',
            'update',
        ],
        'public-widget': [
            'create',
            'delete',
            'get',
            'list',
            'load-sum',
            'load',
            'update',
        ],
    },
    opsflow: {
        comment: [
            'create',
            'delete',
            'get',
            'list',
            'update',
        ],
        event: [
            'list',
        ],
        task: [
            'change-assignee',
            'change-status',
            'create',
            'delete',
            'get',
            'list',
            'update-description',
            'update',
        ],
        'task-category': [
            'create',
            'delete',
            'get',
            'list',
            'update',
        ],
        'task-type': [
            'create',
            'delete',
            'get',
            'list',
            'update-fields',
            'update',
        ],
    },
} as const;
export type APIDoc = typeof API_DOC;
