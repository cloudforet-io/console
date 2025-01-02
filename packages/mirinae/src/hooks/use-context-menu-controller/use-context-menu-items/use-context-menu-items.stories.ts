import { computed, ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import { getContextMenuItems } from '@/controls/context-menu/mock';
import PContextMenu from '@/controls/context-menu/PContextMenu.vue';

import {
    getUseContextMenuItemsArgs, getUseContextMenuItemsArgTypes, getUseContextMenuItemsParameters,
} from './story-helper';
import type { UseContextMenuItemsOptions } from './use-context-menu-items';
import { useContextMenuItems } from './use-context-menu-items';


type UseContextMenuItemsPropsAndCustomArgs = ComponentProps<UseContextMenuItemsOptions>;

const meta: Meta<UseContextMenuItemsPropsAndCustomArgs> = {
    title: 'Hooks/useContextMenuItems',
    argTypes: {
        ...getUseContextMenuItemsArgTypes(),
    },
    parameters: {
        ...getUseContextMenuItemsParameters(),
    },
    args: {
        ...getUseContextMenuItemsArgs(),
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
                <p-button @click="initiateMenu()">Initiate</p-button>
                <p-button @click="reloadMenu()">Reload</p-button>
                <p-context-menu :loading="loading"
                                :menu="refinedMenu"
                                @click-show-more="showMoreMenu()"
                />
            </div>
        `,
        setup(props) {
            const {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu,
            } = useContextMenuItems({
                useReorderBySelection: props.useReorderBySelection,
                selected: computed(() => props.selected),
                useMenuFiltering: props.useMenuFiltering,
                hideHeaderWithoutItems: props.hideHeaderWithoutItems,
                menu: computed(() => props.menu),
                searchText: computed(() => props.searchText),
                pageSize: computed(() => props.pageSize),
                filterItems: computed(() => props.filterItems),
            });
            return {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu,
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PContextMenu, PButton },
        template: `
            <div>
                <p-button @click="initiateMenu()">Initiate</p-button>
                <p-button @click="reloadMenu()">Reload</p-button>
                <p-context-menu :loading="loading"
                                :menu="refinedMenu"
                                @click-show-more="showMoreMenu()"
                />
            </div>
        `,
        setup() {
            const menu = ref(getContextMenuItems());
            const {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu,
            } = useContextMenuItems({
                menu,
                pageSize: 3,
            });
            return {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
