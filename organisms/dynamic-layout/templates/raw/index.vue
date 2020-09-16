<template>
    <div class="w-full">
        <p-panel-top v-if="name">
            {{ name }}
        </p-panel-top>
        <p-raw-data class="mx-4" :item="rootData" />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { get } from 'lodash';
import PRawData from '@/components/organisms/text-editor/raw-data/PRawData_new.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { RawDynamicLayoutProps, RawFetchOptions } from '@/components/organisms/dynamic-layout/templates/raw/type';

export default {
    name: 'PDynamicLayoutRaw',
    components: { PRawData, PPanelTop },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Array, Object],
            default: undefined,
        },
        fetchOptions: {
            type: Object,
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: undefined,
        },
    },
    setup(props: RawDynamicLayoutProps, { emit }) {
        const state = reactive({
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path);
                }
                return props.data;
            }),
            fetchOptionsParam: computed<RawFetchOptions>(() => ({})),
        });

        emit('init', state.fetchOptionsParam);

        return {
            ...toRefs(state),
        };
    },
};
</script>
