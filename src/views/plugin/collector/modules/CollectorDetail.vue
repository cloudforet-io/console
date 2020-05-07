<template>
    <p-dynamic-details :details="details"
                       :data="data"
    />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, defineComponent, getCurrentInstance,
} from '@vue/composition-api';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import { dateTimeViewType } from '@/lib/data-source';


export default defineComponent({
    name: 'CollectorDetail',
    components: {
        PDynamicDetails,
    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { parent }) {
        console.debug('data', props.data);
        const vm: any = getCurrentInstance();
        const state = reactive({
            dataSource: computed(() => [
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
            filtersDataSource: computed(() => [
                { name: vm.$t('COMMON.NAME'), key: 'name' },
                { name: vm.$t('WORD.KEY'), key: 'key' },
                { name: vm.$t('COMMON.TYPE'), key: 'type' },
                { name: vm.$t('COMMON.RESOURCE'), key: 'resource_type' },
            ]),
            details: computed(() => [{
                name: vm.$t('WORD.BASE_INFO'),
                // eslint-disable-next-line camelcase
                data_source: state.dataSource,
            }, {
                name: vm.$t('PANEL.FILTER_FORMAT'),
                // eslint-disable-next-line camelcase
                data_source: state.filtersDataSource,
                // eslint-disable-next-line camelcase
                key_path: 'plugin_info.options.filter_format',
                // eslint-disable-next-line camelcase
                view_type: 'simple-table',
            }]),
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>
