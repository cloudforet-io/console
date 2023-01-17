<template>
    <div>
        <p-dynamic-layout v-for="(layout, idx) in layouts"
                          :key="idx"
                          :name="layout.name"
                          :type="layout.type"
                          :options="layout.options"
                          :data="rootData"
                          :fetch-options="fetchOptions"
                          :type-options="typeOptions"
                          :field-handler="fieldHandler"
                          v-on="getListeners(layout.name, idx)"
        >
            <template v-for="(slot) of slotNames"
                      #[slot]="scope"
            >
                <slot :name="`${name}-${slot}`"
                      v-bind="scope"
                />
            </template>
        </p-dynamic-layout>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import { map, replace } from 'lodash';

import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import type {
    ListDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/list/type';
import type { DynamicLayout } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import { makeByPassListeners } from '@/utils/composition-helpers';

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
            type: [Object, Array, String],
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
        fieldHandler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: ListDynamicLayoutProps, { slots, listeners }) {
        const state = reactive({
            layouts: computed<DynamicLayout[]>(() => props.options.layouts || []),
            rootData: computed(() => {
                if (props.options.root_path) {
                    return getValueByPath(props.data, props.options.root_path);
                }
                return props.data;
            }),
            slotNames: computed(() => (map(slots, (slot: string, name) => replace(name, `${props.name}-`, '')))),
        });

        return {
            ...toRefs(state),
            getListeners(name, idx) {
                return {
                    ...listeners,
                    fetch(...args) {
                        makeByPassListeners(listeners, 'fetch', ...args, name, idx);
                    },
                    select(...args) {
                        makeByPassListeners(listeners, 'select', ...args, name, idx);
                    },
                    export() {
                        makeByPassListeners(listeners, 'export', name, idx);
                    },
                };
            },
        };
    },
};
</script>
