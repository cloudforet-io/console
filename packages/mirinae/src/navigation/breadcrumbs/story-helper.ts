import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getBreadcrumbsArgs = (): Args => ({
    routes: [
        { name: 'Page1', to: { name: 'Page1' } },
        { name: 'Page2', to: { name: 'Page2' } },
        { name: 'Page3' },
    ],
    copiable: false,

});

export const getBreadcrumbsParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getBreadcrumbsArgTypes = (): ArgTypes => ({
    routes: {
        name: 'routes',
        type: { name: 'array' } as SBType,
        description: `Array of route to display.
        \`
        interface Route {
            name: string;
            path?: string;
            to?: Location;
        }
        \`
        `,
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    copiable: {
        name: 'copiable',
        type: 'boolean',
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
        control: 'boolean',
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
    onClickDropdownMEnuItem: {
        name: 'click-dropdown-menu-item',
        description: `Emitted when the click a breadcrumb's dropdown menu item. Handler arguments:
        \`
        [value: Route]
        \`
        `,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default
    click: { table: { disable: true } },
    'click-dropdown-menu-item': { table: { disable: true } },
});
