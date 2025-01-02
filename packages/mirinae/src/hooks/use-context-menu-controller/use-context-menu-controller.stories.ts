import { computed, ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import { getContextMenuItems } from '@/controls/context-menu/mock';
import PContextMenu from '@/controls/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/controls/context-menu/type';

import {
    getUseContextMenuControllerArgs, getUseContextMenuControllerArgTypes, getUseContextMenuControllerParameters,
} from './story-helper';
import type { UseContextMenuControllerOptions } from './use-context-menu-controller';
import { useContextMenuController } from './use-context-menu-controller';


type UseContextMenuControllerPropsAndCustomArgs = ComponentProps<UseContextMenuControllerOptions>;

const meta: Meta<UseContextMenuControllerPropsAndCustomArgs> = {
    title: 'Hooks/useContextMenuController',
    argTypes: {
        ...getUseContextMenuControllerArgTypes(),
    },
    parameters: {
        ...getUseContextMenuControllerParameters(),
    },
    args: {
        ...getUseContextMenuControllerArgs(),
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
                    <p-button @click="showContextMenu()">Show Menu</p-button>
                    <p-button @click="hideContextMenu()">Hide Menu</p-button>
                    <p-button @click="toggleContextMenu()">Toggle Menu</p-button>
                    <p-button @click="initiateMenu()">Initiate</p-button>
                    <p-button @click="reloadMenu()">Reload</p-button>
                </div>
                <div>
                    <div ref="targetRef" style="position: relative">Target</div>
                    <p-context-menu ref="menuRef"
                                    v-if="visibleMenu"
                                    :loading="loading"
                                    :selected="selected"
                                    :menu="refinedMenu"
                                    @click-show-more="showMoreMenu()"
                    />
                </div>
            </div>
        `,
        setup(props) {
            const targetRef = ref(null);
            const menuRef = ref(null);
            const visibleMenu = ref(false);
            const selected = computed(() => props.selected ?? []);
            const {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu, showContextMenu, hideContextMenu, toggleContextMenu,
            } = useContextMenuController({
                targetRef,
                contextMenuRef: menuRef,
                visibleMenu,
                selected,
                useFixedStyle: computed(() => props.useFixedStyle),
                position: computed(() => props.position),
                menuWidth: computed(() => props.menuWidth),
                useReorderBySelection: props.useReorderBySelection,
                useMenuFiltering: props.useMenuFiltering,
                hideHeaderWithoutItems: props.hideHeaderWithoutItems,
                menu: computed(() => props.menu),
                searchText: computed(() => props.searchText),
                pageSize: computed(() => props.pageSize),
            });
            return {
                selected, targetRef, menuRef, visibleMenu, refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu, showContextMenu, hideContextMenu, toggleContextMenu,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};

export const Basic: Story = {
    render: () => ({
        components: { PContextMenu, PButton },
        template: `
            <div>
                <div style="margin-bottom: 1rem">
                    <p-button @click="showContextMenu()">Show Menu</p-button>
                    <p-button @click="hideContextMenu()">Hide Menu</p-button>
                    <p-button @click="toggleContextMenu()">Toggle Menu</p-button>
                    <p-button @click="initiateMenu()">Initiate</p-button>
                    <p-button @click="reloadMenu()">Reload</p-button>
                    <p-button @click="focusOnContextMenu()">Focus on Menu</p-button>
                </div>
                <div>
                    <div ref="targetRef" style="position: relative">Target</div>
                    <p-context-menu ref="menuRef"
                                    v-if="visibleMenu"
                                    :selected="selected"
                                    :loading="loading"
                                    :menu="refinedMenu"
                                    @click-show-more="showMoreMenu()"
                                    @select="handleSelect"
                    />
                </div>
            </div>
        `,
        setup() {
            const targetRef = ref(null);
            const menuRef = ref(null);
            const visibleMenu = ref(false);
            const menu = ref(getContextMenuItems());
            const selected = ref<MenuItem[]>([]);
            const {
                refinedMenu, loading, initiateMenu, reloadMenu, showMoreMenu, showContextMenu, hideContextMenu, toggleContextMenu, focusOnContextMenu,
            } = useContextMenuController({
                targetRef,
                contextMenuRef: menuRef,
                visibleMenu,
                menu,
                pageSize: 3,
                selected,
            });
            const handleSelect = (item: MenuItem) => {
                selected.value = [...selected.value, item];
            };
            return {
                selected,
                targetRef,
                menuRef,
                visibleMenu,
                refinedMenu,
                loading,
                initiateMenu,
                reloadMenu,
                showMoreMenu,
                showContextMenu,
                hideContextMenu,
                toggleContextMenu,
                focusOnContextMenu,
                handleSelect,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};

export const ReorderBySelection: Story = {
    render: () => ({
        components: { PContextMenu, PButton },
        template: `
            <div>
                <div style="margin-bottom: 1rem">
                    <p-button @click="showAndInitiate">Show Menu & Initiate & Reorder</p-button>
                    <p-button @click="hideContextMenu">Hide Menu</p-button>
                    <p-button @click="selected = []">Reset Selection</p-button>
                </div>
                <div>
                    <div ref="targetRef" style="position: relative">Target</div>
                    <p-context-menu ref="menuRef"
                                    v-if="visibleMenu"
                                    :selected="selected"
                                    :loading="loading"
                                    :menu="refinedMenu"
                                    @click-show-more="showMoreMenu()"
                                    @select="handleSelect"
                    />
                </div>
            </div>
        `,
        setup() {
            const targetRef = ref(null);
            const menuRef = ref(null);
            const visibleMenu = ref(false);
            const menu = ref(getContextMenuItems());
            const selected = ref<MenuItem[]>([]);
            const {
                refinedMenu, loading, initiateMenu, showMoreMenu, showContextMenu, hideContextMenu,
            } = useContextMenuController({
                targetRef,
                contextMenuRef: menuRef,
                visibleMenu,
                menu,
                pageSize: 3,
                selected,
                useReorderBySelection: true,
            });
            const handleSelect = (item: MenuItem) => {
                selected.value = [...selected.value, item];
            };
            const showAndInitiate = () => {
                showContextMenu();
                initiateMenu();
            };
            return {
                selected,
                targetRef,
                menuRef,
                visibleMenu,
                refinedMenu,
                loading,
                initiateMenu,
                showMoreMenu,
                showContextMenu,
                hideContextMenu,
                handleSelect,
                showAndInitiate,
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
