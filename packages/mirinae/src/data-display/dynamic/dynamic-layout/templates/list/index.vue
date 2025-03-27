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

            <template v-for="(_, slot) of $scopedSlots"
                      #[slot]="scope"
            >
                <slot :name="slot"
                      v-bind="scope"
                />
            </template>
        </p-dynamic-layout>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { map, replace } from 'lodash';

import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import type { DynamicLayoutFetchOptions, DynamicLayoutFieldHandler, DynamicLayoutTypeOptions } from '@/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout, ListOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import { makeByPassListeners } from '@/utils/composition-helpers';

export default defineComponent({
    name: 'PDynamicLayoutList',
    components: { PDynamicLayout },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object as PropType<ListOptions>,
            default: () => ({}),
        },
        data: {
            type: [Object, Array, String],
            default: undefined,
        },
        fetchOptions: {
            type: Object as PropType<DynamicLayoutFetchOptions>,
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<DynamicLayoutTypeOptions>,
            default: undefined,
        },
        fieldHandler: {
            type: Function as PropType<DynamicLayoutFieldHandler>,
            default: undefined,
        },
    },
    setup(props, { slots, listeners }) {
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
});
</script>
