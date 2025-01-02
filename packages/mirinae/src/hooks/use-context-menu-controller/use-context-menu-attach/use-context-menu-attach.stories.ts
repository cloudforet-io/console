import { ref, computed } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import { getContextMenuItems } from '@/controls/context-menu/mock';
import PContextMenu from '@/controls/context-menu/PContextMenu.vue';

import {
    getUseContextMenuAttachArgs, getUseContextMenuAttachArgTypes, getUseContextMenuAttachParameters,
} from './story-helper';
import type { UseContextMenuAttachOptions } from './use-context-menu-attach';
import { useContextMenuAttach } from './use-context-menu-attach';

type UseContextMenuAttachPropsAndCustomArgs = ComponentProps<UseContextMenuAttachOptions>;

const meta: Meta<UseContextMenuAttachPropsAndCustomArgs> = {
    title: 'Hooks/useContextMenuAttach',
    argTypes: {
        ...getUseContextMenuAttachArgTypes(),
    },
    parameters: {
        ...getUseContextMenuAttachParameters(),
    },
    args: {
        ...getUseContextMenuAttachArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PContextMenu, PButton },
        template: `
            <div>
                <p-button @click="attachMenuItems()">Attach</p-button>
                <p-button @click="resetMenuAndPagination()">Reset</p-button>
                <p-context-menu ref="menuRef" 
                                :loading="attachLoading"
                            :menu="attachedMenu" />
            </div>
        `,
        setup(props) {
            const {
                attachedMenu, attachLoading, resetMenuAndPagination, attachMenuItems,
            } = useContextMenuAttach({
                // attachHandler: computed(() => props.attachHandler),
                menu: computed(() => props.menu),
                searchText: computed(() => props.searchText),
                pageSize: computed(() => props.pageSize),
                filterItems: computed(() => props.filterItems),
            });
            return {
                attachedMenu, attachLoading, resetMenuAndPagination, attachMenuItems,
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PContextMenu, PButton },
        template: `
            <div>
                <div style="margin-bottom: 1rem;">
                    <p-button @click="attachMenuItems()">Attach</p-button>
                    <p-button @click="resetMenuAndPagination()">Reset</p-button>
                </div>
                <p-context-menu ref="menuRef" 
                                :loading="attachLoading"
                            :menu="attachedMenu" />
            </div>
        `,
        setup() {
            const menu = ref(getContextMenuItems());
            const {
                attachedMenu, attachLoading, resetMenuAndPagination, attachMenuItems,
            } = useContextMenuAttach({
                menu,
                pageSize: 10,
            });
            return {
                attachedMenu, attachLoading, resetMenuAndPagination, attachMenuItems,
            };
        },
    }),
};


export const Playground: Story = {
    ...Template,
};
