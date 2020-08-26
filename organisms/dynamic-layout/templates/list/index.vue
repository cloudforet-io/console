<template>
    <div>
        <p-dynamic-layout v-for="(layout, idx) in layouts" :key="idx"
                          :name="layout.name"
                          :type="layout.type"
                          :options="layout.options"
                          :data="rootData"
                          :fetch-options="fetchOptionsMap[layout.name] || fetchOptions"
                          :typeOptions="extraMap[layout.name] || typeOptions"
                          :before-create="beforeCreate"
                          :before-create-field="beforeCreateField"
                          :field-handler="fieldHandler"
                          v-on="getListeners(layout.name, idx)"
        >
            <template v-for="(slot) of slotNames" v-slot:[slot]="scope">
                <slot :name="`${name}-${slot}`" v-bind="scope" />
            </template>
        </p-dynamic-layout>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { map, replace, get } from 'lodash';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import {
    ListDynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/templates/list/type';
import { makeByPassListeners } from '@/components/util/composition-helpers';
import { DynamicLayout } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { DynamicLayoutTypeOptions, DynamicLayoutFetchOptions } from '@/components/organisms/dynamic-layout/type';

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
        beforeCreate: {
            type: Function,
            default: undefined,
        },
        beforeCreateField: {
            type: Function,
            default: undefined,
        },
        fieldHandler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: ListDynamicLayoutProps, { slots, listeners }) {
        const state = reactive({
            layouts: computed<DynamicLayout[]>(() => props.options.layouts || []),
            rootData: computed(() => {
                if (!props.options.root_path) return props.data;
                return get(props.data, props.options.root_path, undefined);
            }),
            slotNames: computed(() => (map(slots, (slot: string, name) => replace(name, `${props.name}-`, '')))),
            fetchOptionsMap: computed<Record<string, Partial<DynamicLayoutFetchOptions>>>(() => props.fetchOptions?.listMap || {}),
            extraMap: computed<Record<string, Partial<DynamicLayoutTypeOptions>>>(() => props.typeOptions?.listMap || {}),
        });

        return {
            ...toRefs(state),
            getListeners(name, idx) {
                return {
                    ...listeners,
                    init(...args) {
                        makeByPassListeners(listeners, 'init', ...args, name, idx);
                    },
                    fetch(...args) {
                        makeByPassListeners(listeners, 'fetch', ...args, name, idx);
                    },
                    select(...args) {
                        makeByPassListeners(listeners, 'select', ...args, name, idx);
                    },
                };
            },
        };
    },
};
</script>
