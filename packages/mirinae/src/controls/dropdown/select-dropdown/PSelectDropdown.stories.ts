import { reactive, toRefs, ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';
import PToggleButton from '@/controls/buttons/toggle-button/PToggleButton.vue';
import PCodeEditor from '@/controls/code-editor/PCodeEditor.vue';
import { menuItems } from '@/controls/context-menu/mock';
import {
    getSelectDropdownMenu,
    getSelectDropdownMenuWithMultiTypes, getHandler, getSelectDropdownMenuWithHeaderNames,
} from '@/controls/dropdown/select-dropdown/mock';
import {
    getSelectDropdownArgs,
    getSelectDropdownArgTypes,
    getSelectDropdownParameters,
} from '@/controls/dropdown/select-dropdown/story-helper';
import { SELECT_DROPDOWN_STYLE_TYPE } from '@/controls/dropdown/select-dropdown/type';
import { useProxyValue } from '@/hooks/use-proxy-state/use-proxy-state';

import PSelectDropdown from './PSelectDropdown.vue';

type PSelectDropdownPropsAndCustomArgs = ComponentProps<typeof PSelectDropdown>;

const meta : Meta<PSelectDropdownPropsAndCustomArgs> = {
    title: 'Controls/Dropdown/Select Dropdown',
    component: PSelectDropdown,
    argTypes: {
        ...getSelectDropdownArgTypes(),
    },
    parameters: {
        ...getSelectDropdownParameters(),
    },
    args: {
        ...getSelectDropdownArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSelectDropdown>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSelectDropdown },
        template: `
            <p-select-dropdown
                :style-type="styleType"
                :appearance-type="appearanceType"
                :size="size"
                :disabled="disabled"
                :invalid="invalid"
                :placeholder="placeholder"
                :selection-label="selectionLabel"
                :selection-highlight="selectionHighlight"
                :show-alert-dot="showAlertDot"
                :show-delete-all-button="showDeleteAllButton"
                :use-fixed-menu-style="useFixedMenuStyle"
                :button-icon="buttonIcon"
                :is-fixed-width="isFixedWidth"
                :reset-selection-on-menu-close="resetSelectionOnMenuClose"
                :is-filterable="isFilterable"
                :visible-menu="proxyVisibleMenu"
                :menu="menu"
                :loading="loading"
                :selected="proxySelected"
                :multi-selectable="multiSelectable"
                :search-text="proxySearchText"
                :readonly="readonly"
                :show-select-header="showSelectHeader"
                :show-select-marker="showSelectMarker"
                :show-clear-selection="showClearSelection"
                :menu-position="menuPosition"
                :index-mode="indexMode"
                :menu-width="menuWidth"
                :boundary="boundary"
                :handler="handler"
                :disable-handler="disableHandler"
                :page-size="pageSize"
                :reset-selected-on-unmounted="resetSelectedOnUnmounted"
                :init-selected-with-handler="initSelectedWithHandler"
                :hide-header-without-items="hideHeaderWithoutItems"
                @update:visible-menu="onUpdateVisibleMenu"
                @update:search-text="onUpdateSearchText"
                @update:selected="onUpdateSelected"
                @select="onSelect"
                @delete-tag="onDeleteTag"
                @click-show-more="onClickShowMore"
                @click-done="onClickDone"
            >
            </p-select-dropdown>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySelected: useProxyValue('selected', props, emit),
                proxySearchText: useProxyValue('searchText', props, emit),
                proxyVisibleMenu: useProxyValue('visibleMenu', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PSelectDropdown },
        template: `
            <div class="h-full w-full overflow">
                <p-select-dropdown :menu="menuItems"></p-select-dropdown>
            </div>
        `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const StyleType: Story = {
    render: () => ({
        components: { PSelectDropdown },
        template: `
            <table class="w-full border-separate border-spacing-1">
                <thead>
                    <tr>
                        <th>default</th>
                        <th>rounded</th>
                        <th>transparent</th>
                        <th>icon-button</th>
                        <th>tertiary-icon-button</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th v-for="styleType in styleTypes" :key="styleType" class="font-normal">
                            <p-select-dropdown :menu="menuItems" :styleType="styleType" class="my-2 mx-auto"/>
                        </th>
                    </tr>
                    <tr>
                        <th v-for="styleType in styleTypes" :key="styleType" class="font-normal">
                            <p-select-dropdown size="sm" :menu="menuItems" :styleType="styleType" class="my-2 mx-auto"/>
                        </th>
                    </tr>
                </tbody>
            </table>
        `,
        setup() {
            return {
                menuItems,
                styleTypes: Object.values(SELECT_DROPDOWN_STYLE_TYPE),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const AppearanceType: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Single select with 'basic', 'badge', 'stack' appearance type</p>
                <p-select-dropdown :menu="menuItems" :selected="singleSelected" />
                <p-select-dropdown size="sm" :menu="menuItems" :selected="singleSelected" />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with 'basic' appearance type</p>
                <p-select-dropdown :menu="menuItems" :selected="multiSelected"  multi-selectable />
                <p-select-dropdown size="sm" :menu="menuItems" :selected="multiSelected"  multi-selectable />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with 'badge' appearance type</p>
                <p-select-dropdown :menu="menuItems" :selected="multiSelected" multi-selectable appearance-type="badge" />
                <p-select-dropdown size="sm" :menu="menuItems" :selected="multiSelected" multi-selectable appearance-type="badge" />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with 'stack' appearance type</p>
                <p-select-dropdown :menu="menuItems" :selected="multiSelected" multi-selectable appearance-type="stack" />
                <br/>
            </div>
        `,
        setup() {
            const state = reactive({
                singleSelected: [menuItems.find((d) => !d.type || d.type === 'item')],
                multiSelected: menuItems.filter((d) => !d.type || d.type === 'item').splice(0, 5),
            });
            return {
                menuItems,
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const Disabled: Story = {
    render: () => ({
        components: { PSelectDropdown },
        template: `
            <table class="w-full border-separate border-spacing-1">
                <thead>
                    <tr>
                        <th>default</th>
                        <th>rounded</th>
                        <th>transparent</th>
                        <th>icon-button</th>
                        <th>tertiary-icon-button</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th v-for="styleType in styleTypes" :key="styleType">
                            <p-select-dropdown :menu="menuItems" :styleType="styleType" class="m-2" disabled/>
                        </th>
                    </tr>
                </tbody>
            </table>
        `,
        setup() {
            return {
                menuItems,
                styleTypes: Object.values(SELECT_DROPDOWN_STYLE_TYPE),
            };
        },
    }),
};

export const Readonly: Story = {
    render: () => ({
        components: { PSelectDropdown },
        template: `
            <div>
            <table class="w-full border-separate border-spacing-1">
                <thead>
                    <tr>
                        <th></th>
                        <th>default</th>
                        <th>rounded</th>
                        <th>transparent</th>
                        <th>icon-button</th>
                        <th>tertiary-icon-button</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>default</th>
                        <th v-for="styleType in styleTypes" :key="styleType" class="font-normal">
                            <p-select-dropdown :menu="menuItems" :selected="singleSelected" :styleType="styleType" class="m-2"/>
                        </th>
                    </tr>
                    <tr>
                        <th>readonly</th>
                        <th v-for="styleType in styleTypes" :key="styleType" class="font-normal">
                            <p-select-dropdown readonly :menu="menuItems" :selected="singleSelected" :styleType="styleType" class="m-2" />
                        </th>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top: 1rem;">
                <p class="text-label-lg font-bold my-3">Single select with 'basic', 'badge', 'stack' appearance type</p>
                <p-select-dropdown :menu="menuItems" :selected="singleSelected" readonly />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with 'basic' appearance type</p>
                <p-select-dropdown :menu="menuItems" :selected="multiSelected"  multi-selectable readonly />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with 'badge' appearance type</p>
                <p-select-dropdown :menu="menuItems" :selected="multiSelected" multi-selectable appearance-type="badge" readonly />
                <p-select-dropdown :menu="menuItems" :selected="singleSelected" multi-selectable appearance-type="badge" readonly />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with 'stack' appearance type</p>
                <p-select-dropdown :menu="menuItems" :selected="multiSelected" multi-selectable appearance-type="stack" readonly />
                <br/>
            </div>
        </div>
        `,
        setup() {
            const state = reactive({
                singleSelected: [menuItems.find((d) => !d.type || d.type === 'item')],
                multiSelected: menuItems.filter((d) => !d.type || d.type === 'item').splice(0, 5),
            });
            return {
                menuItems,
                styleTypes: Object.values(SELECT_DROPDOWN_STYLE_TYPE),
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px" />',
    })],
};

export const Invalid: Story = {
    render: () => ({
        components: { PSelectDropdown },
        template: `
                        <table class="w-full border-separate border-spacing-1">
                            <thead>
                                <tr>
                                    <th>default</th>
                                    <th>rounded</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th class="font-normal">
                                        <p-select-dropdown :menu="menuItems" class="m-2 mx-auto w-6/12" invalid/>
                                    </th>
                                    <th class="font-normal">
                                        <p-select-dropdown :menu="menuItems" styleType="rounded" class="m-2 mx-auto w-6/12" invalid/>
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                    `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px" />',
    })],
};

export const Placeholder: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Default placeholder for single select</p>
                <p-select-dropdown :menu="menuItems" />
                <br/>
                <p class="text-label-lg font-bold my-3">Default placeholder for multi select</p>
                <p-select-dropdown :menu="menuItems" multi-selectable />
                <br/>
                <p class="text-label-lg font-bold my-3">Custom placeholder</p>
                <p-select-dropdown :menu="menuItems" placeholder="Please Select One 😄" />
                <br/>
            </div>
        `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const Block: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Default width</p>
                <p-select-dropdown :menu="menuItems" />
                <br/>
                <p class="text-label-lg font-bold my-3">Block width</p>
                <p-select-dropdown :menu="menuItems" block />
                <br/>
            </div>
        `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const MenuWidth: Story = {
    render: () => ({
        components: { PSelectDropdown },
        template: `
            <div class="h-full w-full overflow">
                <p class="my-4">menu width: 'target-width' (default)</p>
                <p-select-dropdown :menu="menuItems" menu-width="target-width"></p-select-dropdown>
                <p class="my-4">menu width: 'auto'</p>
                <p-select-dropdown :menu="menuItems" menu-width="auto"></p-select-dropdown>
                <p class="my-4">menu width: '300px'</p>
                <p-select-dropdown :menu="menuItems" menu-width="300px"></p-select-dropdown>
            </div>
        `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const SelectionLabel: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Default</p>
                <p-select-dropdown :menu="menuItems" />
                <br/>
                <p class="text-label-lg font-bold my-3">Selection Label</p>
                <p-select-dropdown :menu="menuItems" selection-label="Label" />
                <br/>
            </div>
        `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const SelectionHighlight: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown },
        template: `
            <div>
            <p class="text-label-lg font-bold my-3">Normal</p>
            <p-select-dropdown :menu="menuItems" :selected="selected"  />
            <br/>
            <p class="text-label-lg font-bold my-3">Show selection highlight</p>
            <p-select-dropdown :menu="menuItems" :selected="selected" selection-highlight />
            <br/>
            <p-select-dropdown :menu="menuItems" :selected="selected" selection-highlight style-type="rounded" class="mt-2"/>
            <br/>
            <p class="text-label-lg font-bold my-3">Show selection highlight at badge type</p>
            <p-select-dropdown :menu="menuItems" :selected="selected" multi-selectable appearance-type="badge" selection-highlight/>
            <br/>
            <p class="text-label-lg font-bold my-3">Show selection highlight at badge type with selection label</p>
            <p-select-dropdown :menu="menuItems" :selected="selected" multi-selectable appearance-type="badge" selection-label="Label" selection-highlight/>
            <br/>
            <p class="text-label-lg font-bold my-3">Show selection highlight at stack type</p>
            <p-select-dropdown :menu="menuItems" :selected="selected" multi-selectable appearance-type="stack" selection-highlight/>
            <br/>
            <p class="text-label-lg font-bold my-3">Show selection highlight at stack type with selection label</p>
            <p-select-dropdown :menu="menuItems" :selected="selected" multi-selectable appearance-type="stack" selection-label="Label" selection-highlight/>
            <br/>
            </div>
        `,
        setup() {
            const state = reactive({
                selected: menuItems.filter((d) => !d.type || d.type === 'item').slice(0, 2),
            });
            return {
                menuItems,
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px" />',
    })],
};

export const ShowAlertDot: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown, PButton },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Default</p>
                <p-select-dropdown :menu="menuItems"  />
                <br/>
                <p class="text-label-lg font-bold my-3">Show Alert Dot</p>
                <p-select-dropdown :menu="menuItems" show-alert-dot />
                <br/>
                <p class="text-label-lg font-bold my-3">Show Alert Dot and Selection Highlight at Badge Type</p>
                <p-select-dropdown :menu="menuItems" :selected="selected" multi-selectable show-alert-dot selection-highlight appearance-type="badge"/>
                <br/>
            </div>
        `,
        setup() {
            const state = reactive({
                selected: menuItems.filter((d) => !d.type || d.type === 'item').slice(0, 2),
            });
            return {
                menuItems,
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const ShowDeleteAllButton: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown, PButton },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Default</p>
                <p-select-dropdown :menu="menuItems"  />
                <br/>
                <p class="text-label-lg font-bold my-3">Show delete all button</p>
                <p-select-dropdown :menu="menuItems" show-delete-all-button />
                <br/>
            </div>
        `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const UseFixedMenuStyle: Story = {
    render: () => ({
        components: { PSelectDropdown, PToggleButton },
        template: `
            <div class="bg-gray-100 p-8" style="height: 200px; overflow-y: auto; width: 800px;" id="select-dropdown-wrapper">
                <div class="border border-blue-500" style="height: 500px; width: 1000px;">
                    <p class="text-lg mb-5 leading-7" :class="useFixedMenuStyle ? 'text-gray-800' : 'text-gray-400'">
                        Use Fixed Menu Style: <strong> {{useFixedMenuStyle ? 'On' : 'Off' }}</strong> <p-toggle-button :value="useFixedMenuStyle" @change-toggle="onChange" /> <br/>
                        The menu's style position will be set 'fixed'.<br/>
                        Therefore, the menu is placed on front, except for all other fixed elements with high z-index.<br/>
                        So, it can show upper even if the button is not visible by scrolling. <br/>
                        To avoid this, you can set the boundary prop. <br/>
                        <strong>boundary</strong> prop helps to hide the menu when the button is not visible anymore. <br/>
                        
                    </p>
                    <p-select-dropdown v-if="show" :menu="menuItems" :use-fixed-menu-style="useFixedMenuStyle" boundary=".select-dropdown-wrapper" />
                    <p class="text-lg mt-5 leading-7" :class="useFixedMenuStyle ? 'text-gray-800' : 'text-gray-400'">Multi Selectable</p>
                    <p-select-dropdown v-if="show" :menu="menuItems" :use-fixed-menu-style="useFixedMenuStyle" class="mt-5" multiSelectable parentId="select-dropdown-wrapper" />
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                menu: getSelectDropdownMenu(30, 50),
                useFixedMenuStyle: true,
                show: true,
            });
            const onChange = () => {
                state.show = false;
                state.useFixedMenuStyle = !state.useFixedMenuStyle;
                setTimeout(() => {
                    state.show = true;
                }, 300);
            };
            return {
                menuItems,
                ...toRefs(state),
                onChange,
            };
        },
    }),
};

export const ButtonIconType: Story = {
    render: () => ({
        components: {
            PSelectDropdown,
        },
        template: `
            <table class="w-5/12 border-separate border-spacing-1">
                <thead>
                    <tr>
                        <th>default</th>
                        <th>custom</th>
                    </tr>
                </thead>
                <tbody>
                    <tr >
                        <th class="font-normal"><p-select-dropdown :menu="menuItems" style-type="icon-button" /></th>
                        <th class="font-normal"><p-select-dropdown :menu="menuItems" style-type="icon-button" button-icon="ic_settings" /></th>
                    </tr>
                </tbody>
            </table>
        `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px" />',
    })],
};

export const CustomIconButton: Story = {
    render: () => ({
        components: {
            PSelectDropdown,
            PIconButton,
        },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-select-dropdown :menu="menuItems"
                                 reset-selection-on-menu-close
                                 menu-width="max-content"
                                 @update:visible-menu="handleUpdateVisible"
                >
                    <template #dropdown-icon-button>
                        <p-icon-button name="ic_ellipsis-horizontal"
                                     :activated="visibleMenu"
                                     size="sm"
                                     style-type="tertiary"
                        />
                    </template>
                </p-select-dropdown>
            </div>
        `,
        setup() {
            const visibleMenu = ref(false);
            const handleUpdateVisible = (v) => {
                visibleMenu.value = v;
            };
            return {
                menuItems,
                visibleMenu,
                handleUpdateVisible,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px" />',
    })],
};

export const IsFixedWidth: Story = {
    render: () => ({
        components: { PSelectDropdown },
        /* eslint-disable max-len */
        template: `
            <div class="h-full w-full overflow p-8">
                <p-select-dropdown class="w-96" :menu="menuItems" is-fixed-width placeholder="long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long placeholder "></p-select-dropdown>
                <p-select-dropdown class="mt-5" :menu="menuItems" is-fixed-width :selected="multiSelected" multi-selectable appearance-type="badge" />
            </div>
        `,
        /* eslint-disable max-len */
        setup() {
            const state = reactive({
                multiSelected: menuItems.filter((d) => !d.type || d.type === 'item').splice(0, 15),
            });
            return {
                menuItems,
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px" />',
    })],
};

export const IsFilterable: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown, PButton },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Default</p>
                <p-select-dropdown :menu="menuItems"  />
                <br/>
                <p class="text-label-lg font-bold my-3">Filterable (single selection)</p>
                <p-select-dropdown :menu="menu" is-filterable />
                <br/>
                <p class="text-label-lg font-bold my-3">Filterable (multi selection)</p>
                <p-select-dropdown :menu="menu" is-filterable multi-selectable />
                <br/>
            </div>
        `,
        setup() {
            return {
                menuItems,
            };
        },
    }),
    args: {
        menu: getSelectDropdownMenuWithMultiTypes(),
    },
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const ShowRelatedHeadertotheSelectedZone: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown, PButton, PCodeEditor },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">show headers</p>
                <p-select-dropdown :menu="menu"  multi-selectable is-filterable />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with select header</p>
                <p-select-dropdown :menu="menu" multi-selectable is-filterable hide-header-without-items />
                <br/>
                <br/>
                <p-code-editor :code="JSON.stringify(menu, null, 2)"
                            mode="readOnly"
                            style="height: 200px; max-height: 400px;"
                />
            </div>
        `,
    }),
    args: {
        menu: getSelectDropdownMenuWithHeaderNames(),
    },
    decorators: [() => ({
        template: '<story style="height: 600px" />',
    })],
};

export const UsingCustomHandlerAndLoading: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown, PButton },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Without custom handler(use default handler internally)</p>
                <p-select-dropdown :loading="loading" :menu="menu"  />
                <br/>
                <p class="text-label-lg font-bold my-3">With custom handler</p>
                <p-select-dropdown :handler="menuHandler" :page-size="5" />
                <br/>
                <p class="text-label-lg font-bold my-3">With custom handler and loading</p>
                <p-select-dropdown :loading="loading" :handler="menuHandler" :page-size="5" />
                <br/>
                <p class="text-label-lg font-bold my-3">With custom handler & init selected with handler</p>
                With <span class="text-blue-700">initSelectedWithHandler</span> prop, the selected values' label will be initialized with the handler's result.<br/>
                So you can see the selected values' label even if there is no label property in the given selected items.<br/>
                <br/>
                <p-select-dropdown v-if="isReady" :loading="loading" :handler="menuHandler" :page-size="5" :selected="selected" initSelectedWithHandler />
                <br/>
            </div>
        `,
        setup() {
            const state = reactive({
                loading: false,
                selected: [] as any[],
                isReady: false,
            });
            const simpleHandler = getHandler();
            const menuHandler = async (inputText: string, pageStart?: number, pageLimit?: number, filters?: any[], resultRef?: number) => {
                state.loading = true;
                const res = await simpleHandler(inputText, pageStart, pageLimit, filters, resultRef);
                state.loading = false;
                return res;
            };
            (async () => {
                const res = await simpleHandler('', 0, 2);
                state.selected = res[0].results.map((d: any) => ({ name: d.name }));
                state.isReady = true;
            })();
            return {
                ...toRefs(state),
                menuHandler,
            };
        },
    }),
    args: {
        menu: getSelectDropdownMenuWithMultiTypes(),
    },
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const ShowSelectHeader: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown, PButton },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Multi select without select header</p>
                <p-select-dropdown :menu="menu"  multi-selectable />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with select header</p>
                <p-select-dropdown :menu="menu" multi-selectable show-select-header />
                <br/>
            </div>
        `,
    }),
    args: {
        menu: getSelectDropdownMenuWithMultiTypes(),
    },
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const ShowSelectMarker: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Single select without marker</p>
                <p-select-dropdown :menu="menu" />
                <br/>
                <p class="text-label-lg font-bold my-3">Single select with marker</p>
                <p-select-dropdown :menu="menu" show-select-marker />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select without marker</p>
                <p-select-dropdown :menu="menu" multi-selectable />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi select with marker</p>
                <p-select-dropdown :menu="menu" multi-selectable show-select-marker />
                <br/>
            </div>
        `,
    }),
    args: {
        menu: getSelectDropdownMenuWithMultiTypes(),
    },
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};
export const ShowClearSelection: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Without Clear Selection</p>
                <p-select-dropdown :menu="menu" multi-selectable />
                <br/>
                <p class="text-label-lg font-bold my-3">With Clear Selection</p>
                <p-select-dropdown :menu="menu" multi-selectable show-select-marker />
                <br/>
            </div>
        `,
    }),
    args: {
        menu: getSelectDropdownMenuWithMultiTypes(),
    },
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const MenuPosition: Story = {
    render: () => ({
        components: { PSelectDropdown },
        template: `
            <table class="w-full border-separate border-spacing-1">
                <thead>
                    <tr>
                        <th>left</th>
                        <th>right</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th class="font-normal">
                            <p-select-dropdown :menu="menuItems" class="m-2 mx-auto w-24"  />
                        </th>
                        <th class="font-normal">
                            <p-select-dropdown :menu="menuItems" class="m-2 mx-auto w-24" menu-position="right"/>
                        </th>
                    </tr>
                </tbody>
            </table>
        `,
        setup() {
            return {
                menuItems,
                styleTypes: Object.values(SELECT_DROPDOWN_STYLE_TYPE),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px" />',
    })],
};

export const DisableHandler: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown, PButton },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">With default handler </p>
                <p-select-dropdown :menu="menu" />
                <br/>
                <p class="text-label-lg font-bold my-3">Disable handler </p>
                <p-select-dropdown :menu="menu" disable-handler />
                <br/>
            </div>
        `,
    }),
    args: {
        menu: getSelectDropdownMenuWithMultiTypes(),
    },
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const ShowMoreAndPageSize: Story = {
    render: () => ({
        props: Object.keys(getSelectDropdownArgTypes()),
        components: { PSelectDropdown, PButton },
        template: `
            <div style="width: 90%;">
                <p class="text-label-lg font-bold my-3">Without custom handler, single select, with page size 5</p>
                <p-select-dropdown :menu="menu" :page-size="5" />
                <br/>
                <p class="text-label-lg font-bold my-3">With custom handler, single select, with page size 5</p>
                <p-select-dropdown :handler="simpleHandler" :page-size="5" />
                <br/>
                <p class="text-label-lg font-bold my-3">Without custom handler, multi select, with page size 5</p>
                <p-select-dropdown :menu="menu" multi-selectable :page-size="5" />
                <br/>
                <p class="text-label-lg font-bold my-3">With custom handler, multi select, with page size 5</p>
                <p-select-dropdown :handler="simpleHandler" multi-selectable :page-size="5" />
                <br/>
            </div>
        `,
        setup() {
            const state = reactive({
                loading: false,
            });
            const simpleHandler = async (inputText, pageStart, pageLimit) => {
                state.loading = true;
                const results = await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(getSelectDropdownMenu(5, 5, inputText));
                    }, 500);
                });
                state.loading = false;
                return { results, more: pageLimit < 15 };
            };
            return {
                ...toRefs(state),
                simpleHandler,
            };
        },
    }),
    args: {
        menu: getSelectDropdownMenu(11, 22),
    },
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};

export const Playground: Story = {
    ...Template,
    args: {
        menu: getSelectDropdownMenu(),
    },
    decorators: [() => ({
        template: '<story style="height: 400px" />',
    })],
};
