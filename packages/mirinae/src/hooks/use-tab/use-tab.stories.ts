import { ref } from 'vue';

import type { Meta } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PI from '@/foundation/icons/PI.vue';
import PTextarea from '@/inputs/textarea/PTextarea.vue';

import type { UseTabOptions } from './use-tab';
import { useTab } from './use-tab';

type UseTabPropsAndCustomArgs = ComponentProps<UseTabOptions>;

const meta: Meta<UseTabPropsAndCustomArgs> = {
    title: 'Hooks/useTab',
};

export default meta;


export const WithStringTabs = {
    render: () => ({
        template: `
            <div>
                <ul>
                    <li v-for="tab in tabItems" :key="tab.name" class="p-2 cursor-pointer hover:bg-gray-100" @click="activeTab = tab.name"
                        :class="{
                        'font-bold': tab.name === currentTabItem?.name,
                        'text-blue-500': tab.name === currentTabItem?.name,
                    }">
                        {{ tab.label }}
                    </li>
                </ul>
                <div class="mt-4 p-2 text-gray-800 bg-gray-100">
                    <p class="mb-2">currentTabItem:</p>
                    <pre>{{ currentTabItem }}</pre>
                </div>
            </div>
        `,
        setup() {
            const activeTab = ref('tab1');
            const { tabItems, currentTabItem } = useTab({
                tabs: ['tab1', 'tab2'],
                activeTab,
            });
            return {
                activeTab,
                tabItems,
                currentTabItem,
            };
        },
    }),
};

export const WithObjectTabs = {
    render: () => ({
        template: `
            <div>
                <ul>
                    <li v-for="tab in tabItems" :key="tab.name" class="p-2 cursor-pointer hover:bg-gray-100" @click="activeTab = tab.name"
                        :class="{
                        'font-bold': tab.name === currentTabItem?.name,
                        'text-blue-500': tab.name === currentTabItem?.name,
                    }">
                        {{ tab.label }}
                    </li>
                </ul>
                <div class="mt-4 p-2 text-gray-800 bg-gray-100">
                    <p class="mb-2">currentTabItem:</p>
                    <pre>{{ currentTabItem }}</pre>
                </div>
            </div>
        `,
        setup() {
            const activeTab = ref('tab1');
            const { tabItems, currentTabItem } = useTab({
                tabs: [{ name: 'tab1', label: 'Tab Labels' }, { name: 'tab2', label: 'Can be Duplicated' }, { name: 'tab3', label: 'Can be Duplicated' }],
                activeTab,
            });
            return {
                activeTab,
                tabItems,
                currentTabItem,
            };
        },
    }),
};

export const WithSubItems = {
    render: () => ({
        template: `
            <div>
                <ul>
                    <li v-for="tab in tabItems" :key="tab.name">
                        <p class="p-2 cursor-pointer hover:bg-gray-100"
                        :class="{
                            'font-bold': tab.name === currentTabItem?.name,
                            'text-blue-500': tab.name === currentTabItem?.name,
                        }" @click="handleClickTabItem(tab)">{{ tab.label }}</p>
                        <ul class="pl-4" v-if="tab.subItems && currentTabItem?.name === tab.name">
                            <li v-for="subItem in tab.subItems" :key="subItem.name" 
                                class="p-2 cursor-pointer hover:bg-gray-100"
                                :class="{
                                    'font-bold': subItem.name === activeSubTab,
                                    'text-green-500': subItem.name === activeSubTab,
                                }" 
                                @click="handleClickSubItem(subItem, tab)"
                            >
                                {{ subItem.label }}
                            </li>
                        </ul>
                    </li>
                </ul>
                <div class="mt-4 p-2 text-gray-800 bg-gray-100">
                    <p class="mb-2">activeTab:</p>
                    <pre>{{ activeTab }}</pre>
                </div>
                <div class="mt-4 p-2 text-gray-800 bg-gray-100">
                    <p class="mb-2">activeSubTab:</p>
                    <pre>{{ activeSubTab }}</pre>
                </div>
            </div>
        `,
        setup() {
            const activeTab = ref('tab1');
            const { tabItems, currentTabItem } = useTab({
                tabs: ['tab1', {
                    name: 'tab2',
                    subItems: [
                        { name: 'sub1', label: 'Sub1' },
                        { name: 'sub2', label: 'Sub2' },
                    ],
                }],
                activeTab,
            });
            const activeSubTab = ref('');
            const handleClickTabItem = (tabItem) => {
                activeTab.value = tabItem.name;
                activeSubTab.value = '';
            };
            const handleClickSubItem = (subItem, tabItem) => {
                activeTab.value = tabItem.name;
                activeSubTab.value = subItem.name;
            };
            return {
                activeTab,
                activeSubTab,
                tabItems,
                currentTabItem,
                handleClickTabItem,
                handleClickSubItem,
            };
        },
    }),
};

export const WithKeepAlive = {
    render: () => ({
        components: {
            InnerComponent: {
                components: { PTextarea },
                template: `
                    <div class="p-4 border border-blue-200" style="height: 130px; width: 100%">
                        <p class="mb-2">Input something in the input below and switch tabs</p>
                        <p-textarea placeholder="Input something"></p-textarea>
                    </div>
                `,
            },
        },
        template: `
            <div>
                <ul class="flex">
                    <li v-for="tab in tabItems" :key="tab.name" class="p-2 cursor-pointer hover:bg-gray-100" @click="activeTab = tab.name"
                        :class="{
                        'font-bold': tab.name === currentTabItem?.name,
                        'text-blue-500': tab.name === currentTabItem?.name,
                    }">
                        {{ tab.label }}
                    </li>
                </ul>
                <keep-alive v-for="name in keepAliveTabNames">
                    <inner-component v-if="name === currentTabItem?.name" :key="'keep-alive-' + name" />
                </keep-alive>
                <template v-for="name in nonKeepAliveTabNames">
                    <inner-component v-if="name === currentTabItem?.name" :key="'non-keep-alive-' + name" />
                </template>
                <div class="mt-4 p-2 text-gray-800 bg-gray-100">
                    <p class="mb-2">currentTabItem:</p>
                    <pre>{{ currentTabItem }}</pre>
                </div>
            </div>
        `,
        setup() {
            const activeTab = ref('keep-alive');
            const {
                tabItems, currentTabItem,
                keepAliveTabNames, nonKeepAliveTabNames,
            } = useTab({
                tabs: [{
                    name: 'keep-alive',
                    label: 'Keep Alive',
                    keepAlive: true,
                },
                {
                    name: 'no-keep-alive',
                    label: 'No Keep Alive',
                    keepAlive: false,
                }],
                activeTab,
            });
            return {
                activeTab,
                tabItems,
                currentTabItem,
                keepAliveTabNames,
                nonKeepAliveTabNames,
            };
        },
    }),
};

export const WithDefaultItem = {
    render: () => ({
        components: { PI },
        template: `
            <div>
                <ul>
                    <li v-for="tab in tabItems" :key="tab.name" class="p-2 cursor-pointer hover:bg-gray-100" @click="activeTab = tab.name"
                        :class="{
                        'font-bold': tab.name === currentTabItem?.name,
                        'text-blue-500': tab.name === currentTabItem?.name,
                    }">
                        {{ tab.label }} <p-i :name="tab.icon" />
                    </li>
                </ul>
                <div class="mt-4 p-2 text-gray-800 bg-gray-100">
                    <p class="mb-2">currentTabItem:</p>
                    <pre>{{ currentTabItem }}</pre>
                </div>
            </div>
        `,
        setup() {
            const activeTab = ref('tab1');
            const {
                tabItems,
                currentTabItem,
            } = useTab({
                tabs: ['tab1', 'tab2', {
                    name: 'tab3',
                    icon: 'ic_face-frown',
                }],
                activeTab,
                defaultItem: { icon: 'ic_face-smile' },
            });
            return {
                activeTab,
                tabItems,
                currentTabItem,
            };
        },
    }),
};
