<template>
    <section class="event-list-wrapper">
        <p-toolbox
            search-type="plain"
            :total-count="totalCount"
            :page-size-changeable="false"
            :pagination-visible="false"
            @change="onChange"
            @refresh="onChange()"
        />
        <template v-for="(item, idx) in itemList">
            <alert-detail-vertical-timeline :key="item.event_id" :item="item" :timezone="timezone"
                                            class="timeline"
            >
                <template #timeline-detail>
                    <span class="severity">[{{ item.severity }}]</span> {{ item.title }} <br>
                    {{ item.description }}
                </template>
            </alert-detail-vertical-timeline>
        </template>
        <p-button v-if="itemList.length > 9" size="md"
                  style-type="primary-dark outline"
                  class="more-button"
                  @click="onClickMore"
        >
            {{ $t('MONITORING.ALERT.DETAIL.EVENT_LIST.MORE') }}
        </p-button>
    </section>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { store } from '@/store';
import { getApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import AlertDetailVerticalTimeline
    from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailVerticalTimeline.vue';
import { Event } from '@/views/monitoring/alert-manager/type';
import { PButton, PToolbox } from '@spaceone/design-system';

const PAGE_SIZE = 10;

export default {
    name: 'AlertDetailEventList',
    components: {
        AlertDetailVerticalTimeline,
        PToolbox,
        PButton,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const eventListApiQueryHelper = new ApiQueryHelper()
            .setSort('created_at', true)
            .setPage(1, 10)
            .setFilters([{ k: 'alert_id', v: props.id, o: '=' }]);
        let eventListApiQuery = eventListApiQueryHelper.data;

        const state = reactive({
            itemList: [] as Event[],
            timezone: computed(() => store.state.user.timezone),
            totalCount: 0,
            thisPage: 1,
            pageLimit: 10,
        });

        const listEvent = async () => {
            const { results, total_count } = await SpaceConnector.client.monitoring.event.list({ query: eventListApiQuery });
            state.itemList = results;
            state.totalCount = total_count;
        };

        const onChange = async (options: any = {}) => {
            eventListApiQuery = getApiQueryWithToolboxOptions(eventListApiQueryHelper, options) ?? eventListApiQuery;
            if (options.searchText !== undefined) {
                eventListApiQueryHelper.setPageStart(1);
                eventListApiQueryHelper.setPageLimit(10);
            }
            await listEvent();
        };

        const onClickMore = async () => {
            state.thisPage += 1;
            state.pageLimit = state.thisPage * PAGE_SIZE;
            eventListApiQueryHelper.setPageLimit(state.pageLimit);
            await listEvent();
        };

        (async () => {
            await listEvent();
        })();

        return {
            ...toRefs(state),
            onChange,
            onClickMore,
        };
    },
};
</script>

<style lang="postcss" scoped>
.event-list-wrapper {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-bottom: 2.5rem;
}
.severity {
    @apply font-bold capitalize;
}
.timeline {
    padding-top: 1rem;
}
.more-button {
    display: flex;
    width: 100%;
    margin-top: 1.5rem;
}
</style>
