import type { ArgTypes } from '@storybook/addons';

export const getBreadcrumbsArgTypes = (): ArgTypes => ({
    routes: {
        name: 'routes',
        type: { name: 'array' },
        description: `Array of route to display.
        \`
        interface Route {
            name: string;
            path?: string;
            to?: RouteLocation;
        }
        \`
        `,
        defaultValue: [
            { name: 'Page1', to: { name: 'Page1' } },
            { name: 'Page2', to: { name: 'Page2' } },
            { name: 'Page3' },
        ],
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    copiable: {
        name: 'copiable',
        type: { name: 'boolean' },
        description: 'Whether copying is possible or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    /* events */
    onClick: {
        name: 'click',
        description: `Emitted when the click a breadcrumb item. Handler arguments:
        \`
        [route: Route, index: number]
        \`
        `,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
