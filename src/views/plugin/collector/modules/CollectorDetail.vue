<template>
    <div>
        <p-panel-top>{{ name }}</p-panel-top>
        <p-definition-table :fields="fields" :data="data" :loading="isLoading"
                            :skeleton-rows="7" v-on="$listeners"
        >
            <template #data-name>
                <p-lazy-img :img-url="data.tags.icon" width="1rem" height="1rem" />
                <span class="ml-2 leading-none">{{ data.name }}</span>
            </template>
        </p-definition-table>
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { dateTimeViewType } from '@/lib/data-source';
import { fluentApi } from '@/lib/fluent-api';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';

export default {
    name: 'CollectorDetail',
    components: {
        PPanelTop,
        PDefinitionTable,
        PLazyImg,
    },
    props: {
        collectorId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm: ComponentInstance = getCurrentInstance() as ComponentInstance;
        const state = reactive({
            name: vm.$t('WORD.BASE_INFO'),
            isLoading: true,
            fields: computed(() => [
                { name: vm.$t('WORD.ID'), key: 'collector_id' },
                { name: vm.$t('COMMON.NAME'), key: 'name' },
                { name: vm.$t('SERVICE.PROVIDER'), key: 'provider' },
                { name: vm.$t('COMMON.PRIORITY'), key: 'priority' },
                {
                    name: vm.$t('COMMON.RESOURCE'),
                    key: 'plugin_info.options.supported_resource_type',
                    type: 'list',
                    options: {
                        item: {},
                        delimiter: ', ',
                    },
                },
                { name: vm.$t('COMMON.LAST_COL'), key: 'last_collected_at.seconds', ...dateTimeViewType },
                { name: vm.$t('COMMON.CREATED'), key: 'created_at.seconds', ...dateTimeViewType },
            ]),
            data: {},
        });

        const getCollectorDetailData = async () => {
            const res = await fluentApi.inventory().collector().get().setId(props.collectorId)
                .execute();
            state.isLoading = false;
            if (res.data) state.data = res.data;
        };

        watch(() => props.collectorId, () => {
            getCollectorDetailData();
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
