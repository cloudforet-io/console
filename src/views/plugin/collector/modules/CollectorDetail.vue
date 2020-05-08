<template>
    <s-dynamic-layout :key="layout.name" :layout="layout"
                      v-bind="layout"
                      :api="api"
    />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, defineComponent, getCurrentInstance,
} from '@vue/composition-api';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import { dateTimeViewType } from '@/lib/data-source';
import { fluentApi } from '@/lib/fluent-api';


export default defineComponent({
    name: 'CollectorDetail',
    components: {
        PDynamicDetails,
        SDynamicLayout,
    },
    props: {
        collectorId: {
            type: String,
            required: true,
        },
    },
    setup(props, { parent }) {
        const vm: any = getCurrentInstance();
        const state = reactive({
            baseInfoFields: computed(() => [
                { name: vm.$t('WORD.ID'), key: 'collector_id' },
                { name: vm.$t('COMMON.NAME'), key: 'name' },
                { name: vm.$t('SERVICE.PROVIDER'), key: 'provider' },
                { name: vm.$t('COMMON.PRIORITY'), key: 'priority' },
                {
                    name: vm.$t('COMMON.RESOURCE'),
                    key: 'plugin_info.options.supported_resource_type',
                    type: 'list',
                    options: {
                        item: {
                            type: 'badge',
                        },
                        delimiter: ', ',
                    },
                },
                { name: vm.$t('COMMON.LAST_COL'), key: 'last_collected_at.seconds', ...dateTimeViewType },
                { name: vm.$t('COMMON.CREATED'), key: 'created_at.seconds', ...dateTimeViewType },
            ]),
            filtersFields: computed(() => [
                { name: vm.$t('COMMON.NAME'), key: 'name' },
                { name: vm.$t('WORD.KEY'), key: 'key' },
                { name: vm.$t('COMMON.TYPE'), key: 'type' },
                { name: vm.$t('COMMON.RESOURCE'), key: 'resource_type' },
            ]),
            layouts: computed(() => ([
                {
                    name: vm.$t('WORD.BASE_INFO'),
                    type: 'item',
                    options: {
                        fields: state.baseInfoFields,
                    },
                },
                {
                    name: vm.$t('PANEL.FILTER_FORMAT'),
                    type: 'simple-table',
                    options: {
                        // eslint-disable-next-line camelcase
                        root_path: 'plugin_info.options.filter_format',
                        fields: state.filtersFields,
                    },
                },
            ])),
            layout: computed(() => ({
                name: 'Base Information',
                type: 'list',
                options: {
                    layouts: state.layouts,
                },
            })),
            api: computed(() => ({
                resource: fluentApi.inventory().collector().get().setId(props.collectorId),
            })),
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>
