<template>
    <div>
        <p-dynamic-layout v-for="(layout, idx) in layouts" :key="idx"
                          :name="layout.name"
                          :type="layout.type"
                          :options="layout.options"
                          :data="rootData"
                          :loading="loading"
                          :total-count="totalCount"
                          :timezone="timezone"
                          :init-props="initProps"
                          @init="$emit('init', ...arguments, layout.name, idx)"
                          @fetch="$emit('fetch', ...arguments, layout.name, idx)"
                          @select="$emit('select', ...arguments, layout.name, idx)"
        >
            <template v-for="(slot) of slotNames" v-slot:[slot]="scope">
                <slot :name="`${name}-${slot}`" v-bind="scope" />
            </template>
        </p-dynamic-layout>
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { map, replace, get } from 'lodash';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import { ListDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/list/type';
import { DynamicLayout } from '@/components/organisms/dynamic-layout/type';

export default {
    name: 'PDynamicLayoutList',
    components: { PDynamicLayout },
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
            type: Array,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: undefined,
        },
        timezone: {
            type: String,
            default: undefined,
        },
        initProps: {
            type: Object,
            default: undefined,
        },
    },
    setup(props: ListDynamicLayoutProps, { slots }) {
        const state = reactive({
            layouts: computed<DynamicLayout[]>(() => props.options.layouts || []),
            rootData: computed(() => {
                if (!props.options.root_path) return props.data;
                return get(props.data, props.options.root_path, undefined);
            }),
            slotNames: computed(() => (map(slots, (slot: string, name) => replace(name, `${props.name}-`, '')))),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
