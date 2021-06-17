<template>
    <p-list-card
        v-if="totalCount > 0 && assignedVisible"
        :items="items"
        class="assigned-alert-list"
        style-type="indigo400"
    >
        <template #header>
            <p-i name="ic_notification" width="1.25rem" height="1.25rem"
                 class="ic_notification"
                 color="white"
            />
            {{ $t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_YOU_TITLE') }}
            <p-i name="ic_delete" width="1.25rem" height="1.25rem"
                 class="ic_delete cursor-pointer"
                 color="inherit"
                 @click="hideAssignedAlert"
            />
        </template>
        <template #item="{item, index}">
            <alert-list-item :item="item" />
        </template>
    </p-list-card>
</template>
<script lang="ts">
import {
    PListCard, PI,
} from '@spaceone/design-system';
import AlertListItem from '@/views/monitoring/alert/components/AlertListItem.vue';
import { reactive, toRefs } from '@vue/composition-api';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';

export default {
    name: 'AlertAssignedList',
    components: {
        AlertListItem,
        PListCard,
        PI,
    },
    setup() {
        const state = reactive({
            items: [],
            totalCount: 0,
            assignedVisible: true,
        });

        /* api */
        const getQuery = () => {
            const apiQuery = new ApiQueryHelper();
            apiQuery
                .setSort('created_at', true)
                .setFilters([{ k: 'assignee', v: store.state.user.userId, o: '=' }]);
            return apiQuery.data;
        };
        const getAssignedAlerts = async () => {
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({ query: getQuery() });
                state.items = results;
                state.totalCount = total_count;
            } catch (e) {
                state.items = [];
                state.totalCount = 0;
                console.error(e);
            }
        };

        /* event */
        const hideAssignedAlert = () => {
            state.assignedVisible = false;
        };

        /* init */
        (async () => {
            await getAssignedAlerts();
        })();

        return {
            ...toRefs(state),
            getAssignedAlerts,
            hideAssignedAlert,
        };
    },
};
</script>
<style lang="postcss" scoped>
.assigned-alert-list::v-deep {
    @apply col-span-12;
    header {
        @apply flex items-center;

        .ic_notification {
            @apply inline-block;
            margin-right: 0.25rem;
        }
        .ic_delete {
            @apply ml-auto;
        }
    }
    .body {
        @apply overflow-y-auto;
        max-height: 10.5rem;
    }
}
</style>
