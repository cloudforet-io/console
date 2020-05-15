<template>
    <s-dynamic-layout v-bind="layout"
                      :api="api"
                      :vbind="{colCopy: true}"
                      @copy:name="onCopyName"
    >
        <template v-slot:[slotName]="{data, rootData}">
            <span class="inline-flex items-center">
                <p-lazy-img :img-url="rootData.tags.icon" width="1rem" height="1rem" />
                <span class="ml-2 leading-none">{{ data }}</span>
            </span>
        </template>
    </s-dynamic-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, getCurrentInstance,
} from '@vue/composition-api';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import { dateTimeViewType } from '@/lib/data-source';
import { fluentApi } from '@/lib/fluent-api';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import { copyAnyData } from '@/lib/util';

export default {
    name: 'CollectorDetail',
    components: {
        PLazyImg,
        SDynamicLayout,
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
                            // type: 'badge',
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
                resource: fluentApi.inventory().collector().get().setId(props.collectorId)
                    .setFixOnly('tags'),
            })),
            slotName: computed(() => `${vm.$t('WORD.BASE_INFO')}-data-name`),
        });
        return {
            ...toRefs(state),
            onCopyName(item) {
                copyAnyData(item.data);
            },
        };
    },
};
</script>
