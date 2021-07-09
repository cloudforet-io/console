<template>
    <section>
        <template v-for="(item, idx) in itemList">
            <alert-detail-vertical-timeline :key="item.event_id" :item="item" :timezone="timezone">
                <template #timeline-detail>
                    <span class="severity">[{{item.severity}}]</span> {{ item.title }} <br />
                    {{ item.description }}
                </template>
            </alert-detail-vertical-timeline>
        </template>
    </section>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';
import AlertDetailVerticalTimeline
    from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailVerticalTimeline.vue';
import { Event } from '@/views/monitoring/alert-manager/type';

export default {
    name: 'AlertDetailEventList',
    components: {
        AlertDetailVerticalTimeline,

    },
    setup() {
        const state = reactive({
            itemList: [] as Event[],
            timezone: computed(() => store.state.user.timezone),
        });
        const apiQuery = new ApiQueryHelper();
        apiQuery.setSort('created_at', true)
            .setFilters([{ k: 'alert_id', v: 'alert-59671a5e7205', o: '=' }]);
        const listEvent = async () => {
            const res = await SpaceConnector.client.monitoring.event.list({ query: apiQuery.data });
            state.itemList = res.results;
        };

        (async () => {
            await listEvent();
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.severity {
    @apply font-bold capitalize;
}
</style>
