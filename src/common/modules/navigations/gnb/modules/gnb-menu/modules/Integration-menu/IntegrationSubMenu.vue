<template>
    <div class="integration-sub-menu">
        <p-tab :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template v-for="({title, sub_menu}) in integrationMenus"
                      #[title]
            >
                <template v-for="(menu, idx) in sub_menu">
                    <g-n-b-sub-menu :key="`extra-${menu.label}-${idx}`"
                                    :label="menu.label"
                                    :href="menu.link"
                                    @navigate="hideMenu"
                    />
                </template>
            </template>
        </p-tab>
    </div>
</template>

<script setup lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PTab } from '@spaceone/design-system';

import { store } from '@/store';

import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';


const emit = defineEmits(['close']);

const state = reactive({
    integrationMenus: computed(() => {
        const extraMenus = store.getters['domain/getDomainExtraMenu'].contents ?? [];
        console.log(extraMenus);
        return extraMenus;
    }),
    tabs: computed(() => state.integrationMenus.map((menu) => ({
        label: menu.title,
        name: menu.title,
        keepAlive: true,
    }))),
    activeTab: '',
});

const hideMenu = () => {
    emit('close');
};

watch(() => state.integrationMenus, (_integrationMenus) => {
    if (_integrationMenus.length) {
        state.activeTab = _integrationMenus[0].title;
    }
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
        width: 27.5rem;
        min-height: auto;
        height: 20rem;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        .tab-pane {
            padding-bottom: 0;
        }
    }
}
</style>
