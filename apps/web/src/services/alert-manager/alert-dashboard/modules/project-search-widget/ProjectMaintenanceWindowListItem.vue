<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PListCard, PI, PLink,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import {
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { PROJECT_ROUTE } from '@/services/project/route-config';

interface Props {
    projectId: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

const state = reactive({
    loading: true,
    items: [],
    totalCount: 0,
});

/* util */
const dateFormatter = (start, end) => {
    const formattedStart = dayjs.utc(start).format('MM/DD HH:mm');
    const formattedEnd = dayjs.utc(end).format('MM/DD HH:mm');
    return `${formattedStart} ~ ${formattedEnd}`;
};

/* api */
const apiQuery = new ApiQueryHelper();
const getQuery = () => {
    apiQuery
        .setSort('created_at', true)
        .setPage(1, 16)
        .setFilters([
            { k: 'projects', v: [props.projectId], o: '' },
            { k: 'state', v: 'OPEN', o: '=' },
        ]);
    return apiQuery.data;
};
const listMaintenanceWindows = async () => {
    try {
        state.loading = true;
        const { results, total_count } = await SpaceConnector.client.monitoring.maintenanceWindow.list({
            query: getQuery(),
        });
        state.items = results;
        state.totalCount = total_count;
    } catch (e) {
        state.items = [];
        state.totalCount = 0;
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

watch(() => props.projectId, async (projectId) => {
    if (projectId) await listMaintenanceWindows();
}, { immediate: true });

</script>

<template>
    <p-list-card class="project-maintenance-window-list-item"
                 :items="state.items"
                 style-type="yellow100"
                 :loading="state.loading"
    >
        <template #header>
            {{ t('MONITORING.ALERT.DASHBOARD.MAINTENANCE_WINDOW') }} ({{ state.totalCount > 15 ? '15+' : state.totalCount }})
        </template>
        <template #item="{item, index}">
            <div v-if="index < 15">
                <div class="title-wrapper">
                    <p-i name="ic_spanner-filled"
                         width="1em"
                         height="1em"
                         color="inherit transparent"
                    />
                    <span class="title">{{ item.title }}</span>
                </div>
                <div class="schedule-wrapper">
                    <b>{{ t('MONITORING.ALERT.DASHBOARD.SCHEDULE') }}</b>
                    <span class="ml-1">{{ dateFormatter(item.start_time, item.end_time) }}</span>
                </div>
            </div>
            <div v-else
                 class="view-all-text"
            >
                <p-link :to="{ name: PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME, params: { id: projectId } }"
                        :text="t('MONITORING.ALERT.DASHBOARD.VIEW_ALL_OPEN_MAINTENANCE_WINDOW')"
                        highlight
                />
            </div>
        </template>
    </p-list-card>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-list-card */
.p-list-card {
    :deep(.body) {
        overflow-y: auto;
        .title-wrapper {
            @apply text-yellow-500;
            display: flex;
            align-items: center;

            .p-i-icon {
                margin-right: 0.5rem;
            }
            .title {
                @apply text-gray-900;
            }
        }
        .schedule-wrapper {
            @apply text-gray-500;
            font-size: 0.75rem;
            padding-left: 1.5rem;
            padding-top: 0.25rem;
        }
        .view-all-text {
            text-align: center;
        }
    }
}
</style>
