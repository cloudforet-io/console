<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PDivider, PSelectDropdown, PTextHighlighting, PI,
} from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

import config from '@/lib/config';

import { violet } from '@/styles/colors';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

interface Props {
    to: {
        name: string;
    } | null;
}

const props = withDefaults(defineProps<Props>(), {
    to: null,
});
const workspaceStore = useWorkspaceStore();
const workspaceStoreState = workspaceStore.$state;
const router = useRouter();

const state = reactive({
    ciLogoImage: computed(() => config.get('DOMAIN_IMAGE.CI_LOGO')),
    workspaceList: computed(() => workspaceStoreState.getters.workspaceList),
    selectedWorkspace: computed<WorkspaceModel|undefined>(() => workspaceStoreState.getters.currentWorkspace),
    workspaceMenuList: computed(() => [...state.workspaceList.map((_workspace) => ({
        name: _workspace.workspace_id,
        label: _workspace.name,
    })),
    ]),
    searchText: '',
});

const selectWorkspace = (workspaceId) => {
    if (workspaceId) {
        workspaceStore.setCurrentWorkspace(workspaceId);
        router.push({ name: HOME_DASHBOARD_ROUTE._NAME, params: { workspaceId } });
    }
};

</script>

<template>
    <div class="gnb-workspace-navigation"
         data-gtm="gtm-gnb-logo"
    >
        <component :is="props.to ? 'router-link' : 'div'"
                   class="inline-block"
                   :to="props.to"
        >
            <img v-if="state.ciLogoImage"
                 class="logo-character"
                 :src="state.ciLogoImage"
            >
            <img v-else
                 class="logo-character"
                 src="@/assets/images/brand/spaceone-default-logo.svg"
            >
        </component>
        <p-divider class="logo-divider"
                   vertical
        />
        <p-select-dropdown class="worksapce-dropdown"
                           style-type="transparent"
                           is-filterable
                           :search-text.sync="state.searchText"
                           :menu="state.workspaceMenuList"
                           :selected="state.selectedWorkspace?.workspace_id"
                           @select="selectWorkspace"
        >
            <template #dropdown-button>
                <span class="selected-workspace">
                    {{ state.selectedWorkspace?.name }}
                </span>
            </template>
            <template #menu-item--format="{ item }">
                <div class="menu-wrapper">
                    <p-i v-if="item.name === state.selectedWorkspace?.workspace_id"
                         class="selected-icon"
                         name="ic_check"
                         width="1rem"
                         height="1rem"
                         :color="violet[500]"
                    />
                    <p-text-highlighting :text="item.label"
                                         :term="state.searchText"
                                         style-type="secondary"
                    />
                </div>
            </template>
        </p-select-dropdown>
    </div>
</template>

<style scoped lang="postcss">
.gnb-workspace-navigation {
    @apply inline-flex w-full bg-white;
    max-width: 16.25rem;
    padding: 0.625rem 1rem 0.625rem 1.25rem;
    box-shadow: 0.1875rem 0 0.1875rem 0 rgba(81, 83, 100, 0.15);

    @screen tablet {
        max-width: 8.75rem;
    }

    .logo-character {
        display: inline-block;
        width: 2rem;
        height: 2rem;
    }
    .logo-divider {
        margin: 0 1rem;
        height: 2rem;
    }
    .worksapce-dropdown {
        @apply inline-flex;
        max-width: 10.1875rem;

        .selected-workspace {
            @apply text-label-lg;
        }
        .menu-wrapper {
            @apply flex items-center;
            .selected-icon {
                margin-right: 0.25rem;
            }
        }
    }
}
</style>
