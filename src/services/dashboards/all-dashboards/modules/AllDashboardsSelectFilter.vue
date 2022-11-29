<template>
    <div class="all-dashboards-select-filter">
        <span class="filter-header">Viewers</span>
        <p-select-status v-for="(view, idx) in viewerFilterList"
                         :key="`view-${idx}`"
                         v-model="proxyViewersStatus.name"
                         class="select-desktop"
                         :value="view.name"
                         @change="handleSelectViewers"
        >
            {{ view.label }}
        </p-select-status>
        <p-select-dropdown class="select-tablet"
                           :selected="proxyViewersStatus.name"
                           :items="viewerFilterList"
                           style-type="transparent"
                           @select="handleSelectViewers"
        />
        <p-divider class="divider"
                   vertical
        />
        <span class="filter-header">Scope</span>
        <p-select-status v-for="(scope, idx) in scopeFilterList"
                         :key="`scope-${idx}`"
                         v-model="proxyScopeStatus.name"
                         class="select-desktop"
                         :value="scope.name"
                         @change="handleSelectScope"
        >
            {{ scope.label }}
        </p-select-status>
        <p-select-dropdown class="select-tablet"
                           :selected="proxyScopeStatus.name"
                           :items="scopeFilterList"
                           style-type="transparent"
                           @select="handleSelectScope"
        />
    </div>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    reactive, toRefs,
} from 'vue';

import { PSelectDropdown, PSelectStatus, PDivider } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import type { DashboardFilterType } from '@/services/dashboards/all-dashboards/type';

export default {
    name: 'AllDashboardsSelectFilter',
    components: { PSelectStatus, PSelectDropdown, PDivider },
    props: {
        viewerStatus: {
            type: Object as PropType<DashboardFilterType>,
            default: undefined,
        },
        scopeStatus: {
            type: Object as PropType<DashboardFilterType>,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            viewerFilterList: [
                {
                    label: i18n.t('All'),
                    name: 'ALL',
                },
                {
                    label: i18n.t('Pubilc'),
                    name: 'PUBLIC',
                },
                {
                    label: i18n.t('Private'),
                    name: 'PRIVATE',
                },
            ],
            scopeFilterList: [
                {
                    label: i18n.t('All'),
                    name: 'ALL',
                },
                {
                    label: i18n.t('Entire Workspace'),
                    name: 'DOMAIN',
                },
                {
                    label: i18n.t('Single Project'),
                    name: 'PROJECT',
                },
            ],
            proxyViewersStatus: useProxyValue('viewerStatus', props, emit),
            proxyScopeStatus: useProxyValue('scopeStatus', props, emit),
        });

        const handleSelectViewers = (filterName: string) => {
            state.proxyViewersStatus = {
                ...state
                    .viewerFilterList.find((d) => d.name === filterName),
            };
        };

        const handleSelectScope = (filterName: string) => {
            state.proxyScopeStatus = {
                ...state
                    .scopeFilterList.find((d) => d.name === filterName),
            };
        };

        return {
            ...toRefs(state),
            handleSelectViewers,
            handleSelectScope,
        };
    },
};
</script>

<style lang="postcss" scoped>
.all-dashboards-select-filter {
    @apply flex items-center;
    height: 2rem;
    margin: 1.125rem 0 0.625rem 0;
    gap: 1rem;

    .filter-header {
        font-size: 0.875rem;
        line-height: 1.25;
        color: gray;
    }

    .divider {
        height: 0.875rem;
    }

    .select-tablet {
        display: none;
    }

    @screen tablet {
        .select-tablet {
            display: block;
        }
        .select-desktop {
            display: none;
        }
    }
}
</style>
