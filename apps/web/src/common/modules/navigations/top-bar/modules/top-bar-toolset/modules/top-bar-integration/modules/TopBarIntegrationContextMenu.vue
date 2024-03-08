<script setup lang="ts">
import {
    computed, onMounted, reactive, ref, toRefs,
} from 'vue';

import { PTab, PI, PTooltip } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { store } from '@/store';

const emit = defineEmits<{(event: 'close'): void;
}>();

const labelRef = ref<HTMLElement|null>(null);

const state = reactive({
    integrationMenus: computed(() => store.getters['domain/domainExtraMenu']?.contents ?? []),
    tabs: computed(() => state.integrationMenus.map((menu) => ({
        label: menu.title,
        name: menu.title,
        keepAlive: true,
    })) as TabItem[]),
    activeTab: '',
});

const isEllipsisActive = () => {
    if (labelRef.value) {
        return (labelRef.value?.offsetWidth < labelRef.value?.scrollWidth);
    } return false;
};

onMounted(() => {
    if (state.integrationMenus.length) state.activeTab = state.integrationMenus[0].title;
});

const {
    integrationMenus,
    tabs,
    activeTab,
} = toRefs(state);

</script>

<template>
    <div class="top-bar-integration-context-menu">
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
                        <p-tooltip :key="`extra-${menu.label}-${idx}`"
                                   :contents="isEllipsisActive() ? menu.label : undefined"
                                   position="bottom"
                        >
                            <router-link class="gnb-sub-menu"
                                         :to="menu.link"
                                         custom
                            >
                                <template #default>
                                    <span>
                                        <a class="gnb-sub-contents"
                                           :href="menu.link"
                                           target="_blank"
                                           @click.stop="emit('close')"
                                        >
                                            <div class="contents-left">
                                                <div ref="labelRef"
                                                     class="label"
                                                >
                                                    {{ menu.label }}
                                                </div>
                                            </div>
                                            <div class="contents-right">
                                                <p-i name="ic_external-link"
                                                     height="1em"
                                                     width="1em"
                                                     color="inherit"
                                                />
                                            </div>
                                        </a>
                                    </span>
                                </template>
                            </router-link>
                        </p-tooltip>
                    </template>
                </div>
            </template>
        </p-tab>
    </div>
</template>

<style scoped lang="postcss">
.top-bar-integration-context-menu {
    @apply bg-white;
    display: flex;
    flex-direction: column;

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        min-height: unset;
        .tab-pane {
            padding-bottom: 0;
        }
    }

    .integration-tab-content-wrapper {
        padding: 0.5rem;
        overflow-y: auto;
        max-height: calc(100vh - $top-bar-height - 1.5rem - 2.75rem);
    }

    .gnb-sub-menu {
        .gnb-sub-contents {
            @apply text-gray-900 rounded flex items-center justify-between;
            position: relative;
            width: 100%;
            height: 2rem;
            font-size: 0.875rem;
            line-height: 1rem;
            text-decoration: none;
            white-space: nowrap;
            cursor: pointer;
            padding: 0.5rem;
            &:hover, &:focus {
                @apply bg-violet-100 text-violet-600;
            }
            &selected {
                @apply text-violet-600;
                background-color: unset;
            }
            &:active {
                @apply bg-white;
            }

            .contents-right {
                @apply flex items-center;
            }

            .contents-left {
                @apply flex items-center;
                width: 80%;
                .label {
                    @apply truncate;
                    display: inline-block;
                    width: 100%;
                    line-height: 1.25;
                }
            }
        }
    }
}
</style>
