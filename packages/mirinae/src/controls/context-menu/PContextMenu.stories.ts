import { reactive, toRefs, watch } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import PToggleButton from '@/controls/buttons/toggle-button/PToggleButton.vue';
import PCodeEditor from '@/controls/code-editor/PCodeEditor.vue';
import { menuItems, longMenuItems, getContextMenuItems } from '@/controls/context-menu/mock';
import { getContextMenuArgTypes, getContextMenuArgs, getContextMenuParameters } from '@/controls/context-menu/story-helper';
import PEmpty from '@/data-display/empty/PEmpty.vue';
import PI from '@/foundation/icons/PI.vue';
import { getTextHighlightRegex } from '@/utils/helpers';

import PContextMenu from './PContextMenu.vue';

type PContextMenuPropsAndCustomArgs = ComponentProps<typeof PContextMenu>;

const meta : Meta<PContextMenuPropsAndCustomArgs> = {
    title: 'Controls/Context Menu',
    component: PContextMenu,
    argTypes: {
        ...getContextMenuArgTypes(),
    },
    parameters: {
        ...getContextMenuParameters(),
    },
    args: {
        ...getContextMenuArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PContextMenu>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PContextMenu },
        template: `
            <div class="h-full overflow p-8">
                <p-context-menu
                    :title="title"
                    :menu="menu"
                    :loading="loading"
                    :selected="selected"
                    :multi-selectable="multiSelectable"
                    :show-select-marker="showSelectMarker"
                    :item-height-fixed="itemHeightFixed"
                    :highlight-term="highlightTerm"
                    :no-select-indication="noSelectIndication"
                    :show-select-header="showSelectHeader"
                    :show-clear-selection="showClearSelection"
                    :readonly="readonly"
                    :reset-selected-on-unmounted="resetSelectedOnUnmounted"
                />
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <p-context-menu :menu="menu"/>
        `,
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const Loading: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <p-context-menu :menu="menu" loading />
        `,
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const NoData: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <p-context-menu :menu="[]" />
        `,
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 4rem;" />',
    })],
};

export const MultiSelectableAndShowSelectMarker: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <div>
                <p class="text-label-lg font-bold mb-3">Single select without marker</p>
                <p-context-menu :menu="menu" :selected.sync="singleSelected"/>
                <br/>
                <p class="text-label-lg font-bold mb-3">Single select with marker</p>
                <p-context-menu :menu="menu" :selected.sync="singleSelected" show-select-marker />
                <br/>
                <p class="text-label-lg font-bold mb-3">Mutli select without marker</p>
                <p-context-menu :menu="menu" :selected.sync="multiSelected" multi-selectable />
                <br/>
                <p class="text-label-lg font-bold mb-3">Mutli select with marker</p>
                <p-context-menu :menu="menu" :selected.sync="multiSelected" multi-selectable show-select-marker />
                <br/>
            </div>
        `,
        setup() {
            const state = reactive({
                singleSelected: [],
                multiSelected: [],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const Title: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <p-context-menu :menu="menu" title="Title" />
        `,
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const HeaderSlot: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <div class="flex h-full flex-col">
            <div class="mt-4">
                <h2 class="mb-4">This is <strong>header</strong> slot</h2>
                <p-context-menu :menu="menu">
                    <template #header>
                        <div class="p-4 bg-blue-100">header slot area</div>
                    </template>
                </p-context-menu>
            </div>
            </div>
                <!--<div>-->
        `,
    }),
    args: {
        menu: menuItems,
    },
};

export const NoDataSlot: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu, PEmpty, PCodeEditor },
        template: `
            <div class="flex h-full flex-col">
                <div class="mt-4">
                    <h2 class="mb-4">This is <strong>no-data-format</strong> slot</h2>
                    <p-context-menu :menu="[]">
                        <template #no-data-format>No Data</template>
                    </p-context-menu>
                </div>
            </div>
        <!--<div>-->
        `,
    }),
    args: {
        menu: menuItems,
    },
};

export const MenuSlot: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu, PCodeEditor },
        template: `
            <div class="flex h-full flex-col">
                <div class="mt-4">
                    <h2 class="mb-4">This is <strong>menu</strong> slot</h2>
                    <p-context-menu :menu="menu">
                        <template #menu="{menu}">
                            <template v-for="(m, i) in menu">
                                <div v-if="m.type === undefined || m.type === 'item'" :key="i"
                                    class="border-b border-blue-200 py-1 text-center text-xs"
                                >
                                    {{m.label}}
                                </div>
                            </template>
                        </template>
                    </p-context-menu>
                </div>
                <div class="mt-4">
                    <h2 class="mb-4">Slot Props:</h2>
                    <p-context-menu :menu="menu" loading v-show="false">
                        <template #menu="slotProps">
                            <pre ref="slotPropsRef">{{slotProps}}</pre>
                        </template>
                    </p-context-menu>
                    <p-code-editor v-if="slotPropsText" read-only :code="slotPropsText" folded style="font-size: 12px;" />
                </div>
            </div>
        <!--<div>-->
        `,
        setup() {
            const state = reactive({
                slotPropsRef: null as any,
                slotPropsText: '',
            });
            watch(() => state.slotPropsRef, (slotPropsRef) => {
                if (slotPropsRef) state.slotPropsText = slotPropsRef.textContent;
            });
            return { ...toRefs((state)) };
        },
    }),
    args: {
        menu: menuItems,
    },
};

export const ItemSlots: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu, PI, PCodeEditor },
        template: `
            <div class="flex h-full flex-col">
                <div class="mt-4">
                    <h2 class="mb-4">This is <strong>item--format</strong> slot</h2>
                    <p-context-menu :menu="menu">
                        <template #item--format="{item}">
                            <div>
                                <p-i name="ic_favorite-filled" width="1rem" height="1rem" />
                                {{item.label}}
                            </div>
                        </template>
                    </p-context-menu>
                </div>
                <div class="mt-4">
                    <h2 class="mb-4">The last item's Slot Props:</h2>
                    <p-context-menu :menu="menu" loading v-show="false">
                        <template #item--format="slotProps">
                            <pre ref="slotPropsRef">{{slotProps}}</pre>
                        </template>
                    </p-context-menu>
                    <p-code-editor v-if="slotPropsText" read-only :code="slotPropsText" folded style="font-size: 12px;" />
                </div>
            </div>
        <!--<div>-->
        `,
        setup() {
            const state = reactive({
                slotPropsRef: null as any,
                slotPropsText: '',
            });
            watch(() => state.slotPropsRef, (slotPropsRef) => {
                if (slotPropsRef) state.slotPropsText = slotPropsRef.textContent;
            });
            return { ...toRefs((state)) };
        },
    }),
    args: {
        menu: menuItems,
    },
};

export const HeaderSlots: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu, PI, PCodeEditor },
        template: `
            <div class="flex h-full flex-col">
                <div class="mt-4">
                    <h2 class="mb-4">This is <strong>header-{item.name}</strong> slot</h2>
                    <p-context-menu :menu="menu">
                        <template #header-others="{item}">
                            <div>
                                <p-i name="ic_favorite-filled" width="1rem" height="1rem" />
                                This is custom header for <strong>{{item.label}}</strong>
                            </div>
                        </template>
                    </p-context-menu>
                </div>
            <div class="mt-4">
                    <h2 class="mb-4">Slot Props:</h2>
                    <p-context-menu :menu="menu" loading v-show="false">
                        <template #header-others="slotProps">
                            <pre ref="slotPropsRef">{{slotProps}}</pre>
                        </template>
                    </p-context-menu>
                    <p-code-editor v-if="slotPropsText" read-only :code="slotPropsText" folded style="font-size: 12px;" />
                </div>
            </div>
            <!--<div>-->
        `,
        setup() {
            const state = reactive({
                slotPropsRef: null as any,
                slotPropsText: '',
            });
            watch(() => state.slotPropsRef, (slotPropsRef) => {
                if (slotPropsRef) state.slotPropsText = slotPropsRef.textContent;
            });
            return { ...toRefs((state)) };
        },
    }),
    args: {
        menu: menuItems,
    },
};

export const BottomSlot: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <div class="flex h-full flex-col">
                <div class="mt-4">
                    <p-context-menu :menu="menu">
                        <template #bottom><div class="border border-coral-300">This is bottom slot.</div></template>
                    </p-context-menu>
                </div>
            </div>
            <!--<div>-->
        `,
    }),
    args: {
        menu: menuItems,
    },
};

export const SearchSlots: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu, PEmpty, PCodeEditor },
        template: `
            <div class="flex h-full flex-col">
                <div class="mt-4">
                    <h2 class="mb-4">This is <strong>search slots</strong></h2>
                    <p-context-menu :menu="menu" searchable>
                        <template #search-left>
                            <div class="p-1 bg-peacock-100 text-peacock-600">Left</div>
                        </template>
                        <template #search-default>
                            <div class="p-1 bg-coral-100 w-full text-coral-600"><input v-model="searchText"/></div>
                        </template>
                        <template #search-right>
                            <div class="p-1 bg-yellow-100 text-yellow-700">Right</div>
                        </template>
                    </p-context-menu>
                </div>
            </div>
        <!--<div>-->
        `,
        setup() {
            const state = reactive({
                searchText: 'Default',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
    args: {
        menu: menuItems,
    },
};

export const ItemsHeightFixed: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <p-context-menu :menu="menu" item-height-fixed/>
        `,
    }),
    args: {
        menu: longMenuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const HighlightTermAndItemTextListSlot: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu, PCodeEditor },
        template: `
            <div>
                <p class="text-lg my-4">highlight term: 'o'</p>
                <p-context-menu :menu="menu" highlight-term="o"/>
                <p class="text-lg my-4">item-text-list slot case of having highlight term: 'o'</p>
                <p-context-menu :menu="menu" highlight-term="o">
                    <template #item-text-list="{text, matched}">
                        <span :class="matched ? 'text-peacock-700' : 'text-peacock-500'">{{text}}</span>
                    </template>
                </p-context-menu>
                <p class="text-lg my-4">The last item's <strong>Slot Props</strong> for <strong>item-text-list</strong> slot with highlight term: 'o'</p>
                <p-code-editor v-if="slotPropsText" read-only :code="slotPropsText" folded style="font-size: 12px;" />
                <p-context-menu v-show="false" :menu="menu" highlight-term="o">
                    <template #item-text-list="slotProps">
                        <pre ref="slotPropsRef">{{slotProps}}</pre>
                    </template>
                </p-context-menu>
            </div>
            <!--<div>-->
        `,
        setup() {
            const state = reactive({
                slotPropsRef: null as any,
                slotPropsText: '',
            });
            watch(() => state.slotPropsRef, (slotPropsRef) => {
                if (slotPropsRef) state.slotPropsText = slotPropsRef.textContent;
            });
            return { ...toRefs((state)) };
        },
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const ShowSelectionHeader: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <p-context-menu :menu="menu" show-select-header multi-selectable />
        `,
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const ShowClearSelection: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <p-context-menu :menu="menu" show-clear-selection multi-selectable show-select-marker />
        `,
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const ShowMore: Story = {
    render: () => ({
        components: { PContextMenu, PButton, PToggleButton },
        template: `
            <div>
                <div class="mb-4 flex gap-4 items-center">
                    <p-button style-type="secondary" @click="handleClickReset" >Reset</p-button>
                    <div>
                        Next items exist: <p-toggle-button :value="hasMore" @change-toggle="hasMore = !hasMore"/>
                    </div>
                </div>
                <p-context-menu :menu="menu" show-clear-selection multi-selectable show-select-marker
                    :loading="loading"
                    @click-show-more="handleClickShowMore"
                />
            </div>
        `,
        setup() {
            const headerItem = { type: 'header', label: 'Names', name: 'names-header' };
            const showMoreItem = { type: 'showMore', name: 'show-more' };
            const state = reactive({
                menu: [headerItem, ...getContextMenuItems(), showMoreItem],
                loading: false,
                hasMore: true,
            });
            const handleClickReset = () => {
                state.menu = [headerItem, ...getContextMenuItems(), showMoreItem];
            };
            const handleClickShowMore = async () => {
                state.loading = true;
                state.menu = await new Promise((resolve) => {
                    setTimeout(() => {
                        let items = state.menu;
                        // remove show more item
                        items.pop();
                        // add menu items
                        items = items.concat(getContextMenuItems());
                        // append show more item if next items exist
                        if (state.hasMore) items.push(showMoreItem);
                        resolve(items);
                    }, 1000);
                });
                state.loading = false;
            };
            return {
                ...toRefs(state),
                handleClickReset,
                handleClickShowMore,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const Searchable: Story = {
    render: () => ({
        components: { PContextMenu },
        template: `
            <div>
                <div class="my-2"><span class="font-bold">searchText:</span> {{searchText}}</div>
                <p-context-menu :menu="menu"
                    searchable
                    :search-text.sync="searchText"
                    :loading="loading"
                    @update:search-text="handleUpdateSearchInput"
                />
            </div>
        `,
        setup() {
            const headerItem = { type: 'header', label: 'Names', name: 'names-header' };
            const allItems = [headerItem, ...getContextMenuItems()];
            const state = reactive({
                menu: allItems,
                loading: false,
                searchText: 'a',
            });
            const handleUpdateSearchInput = async (value) => {
                state.loading = true;
                state.menu = await new Promise((resolve) => {
                    setTimeout(() => {
                        const regex = getTextHighlightRegex(value);
                        resolve(allItems.filter((item) => {
                            // check only item type
                            if (!item.type || item.type === 'item') return regex.test(item.label as string);
                            return true;
                        }));
                    }, 200);
                });
                state.loading = false;
            };
            return {
                ...toRefs(state),
                handleUpdateSearchInput,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const Readonly: Story = {
    render: () => ({
        props: Object.keys(getContextMenuArgTypes()),
        components: { PContextMenu },
        template: `
            <p-context-menu :menu="menu" readonly show-clear-selection multi-selectable show-select-marker />
        `,
    }),
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};

export const Playground: Story = {
    ...Template,
    args: {
        menu: menuItems,
    },
    decorators: [() => ({
        template: '<story style="height: 18rem;" />',
    })],
};
