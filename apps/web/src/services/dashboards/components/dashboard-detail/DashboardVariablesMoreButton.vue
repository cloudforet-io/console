<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core';
import {
    computed,
    reactive, ref, toRef, toRefs, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    debounce,
} from 'lodash';

import { PButton, PContextMenu, useContextMenuController } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { MANAGE_VARIABLES_HASH_NAME } from '@/services/dashboards/constants/manage-variable-overlay-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



interface Props {
    isManageable?: boolean;
    disabled?: boolean;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any | null,
    searchText: '',
    variableSchema: computed(() => ({})),
    variableList: computed<MenuItem[]>(() => []),
    selected: computed<MenuItem[]>(() => []),
});

const {
    visibleMenu,
    refinedMenu,
    hideContextMenu,
    focusOnContextMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    targetRef: toRef(state, 'targetRef'),
    contextMenuRef: toRef(state, 'contextMenuRef'),
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(state, 'searchText'),
    selected: toRef(state, 'selected'),
    menu: toRef(state, 'variableList'),
    pageSize: 10,
});

const containerRef = ref<HTMLElement|null>(null);
onClickOutside(containerRef, hideContextMenu);

// event
const handleOpenOverlay = () => {
    hideContextMenu();
    router.push(getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: { dashboardId: dashboardDetailState.dashboardId ?? '' },
        hash: `#${MANAGE_VARIABLES_HASH_NAME}`,
    }));
};
const handleClickButton = () => {
    if (visibleMenu.value) hideContextMenu();
    else focusOnContextMenu();
};

const handleSelectVariable = (item: MenuItem) => { // idx, isSelected
    if (!item.name) console.error(new Error(`item.name is undefined: ${item.name}`));
    else {
        // TODO: update use
    }
    hideContextMenu();
    state.searchText = '';
};

const handleClearSelection = () => {
    // TODO: update use
    hideContextMenu();
    state.searchText = '';
};

const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);

watch(visibleMenu, (_visibleMenu) => {
    if (_visibleMenu) initiateMenu();
});

const {
    targetRef,
    contextMenuRef,
} = toRefs(state);

</script>

<template>
    <div ref="containerRef"
         class="dashboard-variables-more-button"
         :class="{'open-menu': visibleMenu}"
    >
        <p-button ref="targetRef"
                  icon-left="ic_plus_bold"
                  style-type="highlight"
                  :disabled="props.disabled"
                  @click="handleClickButton"
        >
            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.MORE') }}
        </p-button>
        <p-context-menu v-show="visibleMenu"
                        ref="contextMenuRef"
                        class="variables-menu"
                        searchable
                        :search-text="state.searchText"
                        :menu="refinedMenu"
                        :selected="state.selected"
                        multi-selectable
                        show-select-marker
                        show-clear-selection
                        @click-show-more="showMoreMenu"
                        @keyup:down:end="focusOnContextMenu()"
                        @select="handleSelectVariable"
                        @clear-selection="handleClearSelection"
                        @update:search-text="handleUpdateSearchText"
        >
            <template v-if="!dashboardDetailGetters.isDeprecatedDashboard"
                      #bottom
            >
                <p-button class="manage-variable-button"
                          style-type="secondary"
                          icon-left="ic_settings-filled"
                          @click="handleOpenOverlay"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE') }}
                </p-button>
            </template>
        </p-context-menu>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-more-button {
    @apply inline-block;

    &.open-menu {
        @apply relative;
    }

    .variables-menu {
        z-index: 1000;
        .manage-variable-button {
            @apply w-full;
        }
    }
}
</style>
