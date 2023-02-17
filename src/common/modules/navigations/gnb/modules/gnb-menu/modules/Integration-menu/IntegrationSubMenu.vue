<template>
    <div class="integration-sub-menu">
        <p-tab :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template v-for="({title, sub_menu}, index) in integrationMenus"
                      #[title]
            >
                <div :key="`${title}-${index}`"
                     class="integration-tab-content-wrapper"
                >
                    <template v-for="(menu, idx) in sub_menu">
                        <g-n-b-sub-menu :key="`extra-${menu.label}-${idx}`"
                                        :label="menu.label"
                                        :href="menu.link"
                                        @navigate="hideMenu"
                        >
                            <template #extra-mark>
                                <p-i name="ic_external-link"
                                     height="1em"
                                     width="1em"
                                     color="inherit"
                                />
                            </template>
                        </g-n-b-sub-menu>
                    </template>
                </div>
            </template>
        </p-tab>
    </div>
</template>

<script setup lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PTab, PI } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { store } from '@/store';

import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';


const emit = defineEmits(['close']);

const state = reactive({
    integrationMenus: computed(() => store.getters['domain/getDomainExtraMenu']?.contents ?? []),
    tabs: computed(() => state.integrationMenus.map((menu) => ({
        label: menu.title,
        name: menu.title,
        keepAlive: true,
    })) as TabItem[]),
    activeTab: '',
});

const hideMenu = () => {
    emit('close');
};

watch(() => state.integrationMenus, (_integrationMenus) => {
    if (_integrationMenus.length) state.activeTab = _integrationMenus[0].title;
});

const {
    integrationMenus,
    tabs,
    activeTab,
} = toRefs(state);

</script>

<style scoped lang="postcss">
.integration-sub-menu {
    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 20rem;
        max-width: 27.5rem;
        min-height: auto;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        .tab-pane {
            padding-bottom: 0;
        }
    }

    .integration-tab-content-wrapper {
        padding: 0.5rem;
        min-height: 10rem;
        overflow-y: auto;
        max-height: calc(85vh - 9rem);
    }
}
</style>
