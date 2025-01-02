import { computed, ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import { getContextMenuItems } from '@/controls/context-menu/mock';
import PContextMenu from '@/controls/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/controls/context-menu/type';

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
                <div style="margin-bottom: 1rem">
                    <p-button @click="initiateMenu()">Initiate</p-button>
                    <p-button @click="reloadMenu()">Reload</p-button>
                </div>
                <p-context-menu :loading="loading"
                                :selected="selected"
                                :menu="refinedMenu"
                                @click-show-more="showMoreMenu()"
                />
            </div>
        `,
        setup(props) {
            const selected = computed(() => props.selected);
            const {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu,
            } = useContextMenuItems({
                selected,
                useReorderBySelection: props.useReorderBySelection,
                useMenuFiltering: props.useMenuFiltering,
                hideHeaderWithoutItems: props.hideHeaderWithoutItems,
                menu: computed(() => props.menu),
                searchText: computed(() => props.searchText),
                pageSize: computed(() => props.pageSize),
            });
            return {
                selected, refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu,
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PContextMenu, PButton },
        template: `
            <div>
                <div style="margin-bottom: 1rem">
                    <p-button @click="initiateMenu()">Initiate</p-button>
                    <p-button @click="reloadMenu()">Reload</p-button>
                </div>
                <p-context-menu :loading="loading"
                                :selected="selected"
                                :menu="refinedMenu"
                                @select="handleSelect"
                                @click-show-more="showMoreMenu()"
                />
            </div>
        `,
        setup() {
            const menu = ref(getContextMenuItems());
            const selected = ref<MenuItem[]>([]);
            const {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu,
            } = useContextMenuItems({
                menu,
                pageSize: 3,
                selected,
            });
            const handleSelect = (item: MenuItem) => {
                selected.value = [...selected.value, item];
            };
            return {
                selected, refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu, handleSelect,
            };
        },
    }),
};

export const ReorderBySelection: Story = {
    render: () => ({
        components: { PContextMenu, PButton },
        template: `
            <div>
                <div style="margin-bottom: 1rem">
                    <p-button @click="initiateMenu()">Initiate & Reorder</p-button>
                    <p-button @click="selected = []">Reset Selection</p-button>
                </div>
                <p-context-menu :loading="loading"
                                :selected="selected"
                                :menu="refinedMenu"
                                @select="handleSelect"
                                @click-show-more="showMoreMenu()"
                />
            </div>
        `,
        setup() {
            const menu = ref(getContextMenuItems());
            const selected = ref<MenuItem[]>([]);
            const {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu,
            } = useContextMenuItems({
                menu,
                pageSize: 3,
                selected,
                useReorderBySelection: true,
            });
            const handleSelect = (item: MenuItem) => {
                selected.value = [...selected.value, item];
            };
            return {
                selected, refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu, handleSelect,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
