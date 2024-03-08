<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';
import type { Location } from 'vue-router/types/router';

import {
    PI, PTextHighlighting, PLink, PTooltip,
} from '@spaceone/design-system';
import { clone } from 'lodash';


import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';


interface Props {
    iconName?: string;
    label: string;
    description?: string;
    workspaceId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    iconName: '',
    label: '',
    description: '',
    workspaceId: '',
});
const topBarSearchStore = useTopBarSearchStore();
const router = useRouter();

const storeState = reactive({
    workspaceMap: computed(() => topBarSearchStore.storeState.workspaceMap),
    currentWorkspaceId: computed(() => topBarSearchStore.storeState.currentWorkspaceId),
});

const state = reactive({
    tooltipText: computed(() => `${props.label}${props.description ? ` ∙ ${props.description}` : ''}`),
});

const getTargetWorkspaceRoute = (workspaceId: string): Location => {
    const reversedMatched = clone(router.currentRoute.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
    const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
    return { name: MENU_INFO_MAP[targetMenuId].routeName, params: { workspaceId } };
};
</script>

<template>
    <div class="top-bar-search-list-item">
        <slot name="icon">
            <div v-if="props.iconName"
                 class="icon-background"
            >
                <p-i :name="props.iconName"
                     width="1.25rem"
                     height="1.25rem"
                />
            </div>
        </slot>
        <div class="main-box">
            <p-tooltip :contents="state.tooltipText"
                       position="bottom"
            >
                <div class="upper-part">
                    <p-text-highlighting class="text-item"
                                         :term="topBarSearchStore.getters.trimmedInputText"
                                         :text="props.label"
                    /><span v-if="props.description"
                            class="desc"
                    >
                        <span class="dot">∙</span><span>{{ props.description }}</span>
                    </span>
                </div>
            </p-tooltip>
            <div v-if="props.workspaceId !== storeState.currentWorkspaceId"
                 class="lower-part"
            >
                <div class="left-part">
                    <workspace-logo-icon :text="storeState.workspaceMap[props.workspaceId]?.label"
                                         :theme="storeState.workspaceMap[props.workspaceId]?.data?.tags?.theme"
                                         size="xxs"
                    />
                    <p-link new-tab
                            action-icon="internal-link"
                    >
                        <span class="label">{{ storeState.workspaceMap[props.workspaceId]?.label }}</span>
                    </p-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.top-bar-search-list-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0.125rem 0;
    .icon-background {
        @apply flex items-center justify-center bg-gray-100 rounded-md;
        margin-right: 0.375rem;
        height: 1.5rem;
        width: 1.5rem;
    }

    .main-box {
        @apply flex flex-col;
        width: calc(100% - 1.625rem);
        line-height: 0.9375rem;

        .upper-part {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            .text-item {
                line-height: 1.03125rem;
            }

            .desc {
                @apply text-label-sm text-gray-500;
                .dot {
                    margin: 0 2px;
                    font-weight: 700;
                }
            }
        }

        .lower-part {
            @apply flex justify-between;
            .left-part {
                @apply inline-flex items-center gap-1;
                margin-top: 0;
                line-height: 0.875rem;

                .label {
                    @apply text-label-sm text-gray-500;
                }

                /* custom design-system component - p-link */
                :deep(.p-link) {
                    @apply text-gray-500;
                }
            }
        }
    }
}
</style>
