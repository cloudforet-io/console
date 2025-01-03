import { ref, computed } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getContextMenuItems } from '@/controls/context-menu/mock';
import PContextMenu from '@/controls/context-menu/PContextMenu.vue';

import {
    getUseContextMenuStyleArgs, getUseContextMenuStyleArgTypes, getUseContextMenuStyleParameters,
} from './story-helper';
import type { UseContextMenuStyleOptions } from './use-context-menu-style';
import { useContextMenuStyle } from './use-context-menu-style';


type UseContextMenuStylePropsAndCustomArgs = ComponentProps<UseContextMenuStyleOptions>;

const meta : Meta<UseContextMenuStylePropsAndCustomArgs> = {
    title: 'Hooks/useContextMenuStyle',
    argTypes: {
        ...getUseContextMenuStyleArgTypes(),
    },
    parameters: {
        ...getUseContextMenuStyleParameters(),
    },
    args: {
        ...getUseContextMenuStyleArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PContextMenu },
        template: `
            <div>
                <div ref="targetRef" style="position: relative">Target</div>
                <p-context-menu ref="menuRef" 
                                v-if="visibleMenu"
                                :menu="menu" />
            </div>
        `,
        setup(props) {
            const targetRef = ref(null);
            const menuRef = ref(null);
            const menu = getContextMenuItems();
            useContextMenuStyle({
                targetRef,
                menuRef,
                useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
                visibleMenu: computed(() => props.visibleMenu),
                position: computed(() => props.position),
                menuWidth: computed(() => props.menuWidth),
            });
            return {
                targetRef, menuRef, menu,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};

export const Basic: Story = {
    render: () => ({
        components: { PContextMenu },
        template: `
            <div>
                <div ref="targetRef" style="position: relative">Target</div>
                <p-context-menu ref="menuRef" 
                                v-if="visibleMenu"
                                :menu="menu" />
            </div>
        `,
        setup() {
            const targetRef = ref(null);
            const menuRef = ref(null);
            const visibleMenu = ref(true);
            const menu = getContextMenuItems();
            useContextMenuStyle({
                targetRef,
                menuRef,
                visibleMenu,
            });
            return {
                targetRef, menuRef, visibleMenu, menu,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};

export const Playground: Story = {
    ...Template,
};
