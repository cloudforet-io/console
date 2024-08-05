import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getBreadcrumbsArgTypes, getBreadcrumbsArgs, getBreadcrumbsParameters } from '@/navigation/breadcrumbs/story-helper';

import PBreadcrumbs from './PBreadcrumbs.vue';

type PBreadcrumbsPropsAndCustomArgs = ComponentProps<typeof PBreadcrumbs>;

const meta : Meta<PBreadcrumbsPropsAndCustomArgs> = {
    title: 'Navigation/Breadcrumbs',
    component: PBreadcrumbs,
    argTypes: {
        ...getBreadcrumbsArgTypes(),
    },
    parameters: {
        ...getBreadcrumbsParameters(),
    },
    args: {
        ...getBreadcrumbsArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PBreadcrumbs>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PBreadcrumbs },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-breadcrumbs
                    :routes="routes"
                    :copiable="copiable"
                    @click="onClick"
                    @click-dropdown-menu-item="onClickDropdownMEnuItem"
                ></p-breadcrumbs>
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PBreadcrumbs },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-breadcrumbs :routes="routes"></p-breadcrumbs>
            </div>
        `,
        setup() {
            return {
                routes: [
                    { name: 'Page1', path: '/page1' },
                    { name: 'Page2', path: '/page2' },
                    { name: 'Page3' },
                ],
            };
        },
    }),
};

export const OverFiveRoutes: Story = {
    render: () => ({
        components: { PBreadcrumbs },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-breadcrumbs :routes="routes"></p-breadcrumbs>
            </div>
        `,
        setup() {
            return {
                routes: [
                    { name: 'Page1', path: '/page1' },
                    { name: 'Page2' },
                    { name: 'Page3' },
                    { name: 'Page4' },
                    { name: 'Page5' },
                    { name: 'Page6' },
                ],
            };
        },
    }),
};

export const WithRouteLocation: Story = {
    render: () => ({
        components: { PBreadcrumbs },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-breadcrumbs :routes="routes"></p-breadcrumbs>
            </div>
        `,
        setup() {
            return {
                routes: [
                    { name: 'Page1', to: { name: 'Page1' } },
                    { name: 'Page2', to: { name: 'Page2' } },
                    { name: 'Page3' },
                ],
            };
        },
    }),
};

export const Copiable: Story = {
    render: () => ({
        components: { PBreadcrumbs },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-breadcrumbs :routes="[
                                    { name: 'Page1', to: {name: 'Page1'} },
                                    { name: 'Page2', to: {name: 'Page2'} },
                                    { name: 'Page3' },
                                ]"
                            copiable
                />
                <br/>
                <p-breadcrumbs :routes="[
                                    { name: 'Page1', path: '/page1' },
                                    { name: 'Page2' },
                                    { name: 'Page3' },
                                    { name: 'Page4' },
                                    { name: 'Page5' },
                                    { name: 'Page6' },
                                ]"
                            copiable
                />
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
