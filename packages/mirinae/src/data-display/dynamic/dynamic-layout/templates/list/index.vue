<template>
    <div>
        <p-dynamic-layout v-for="(layout, idx) in state.layouts"
                          :key="idx"
                          :name="layout.name"
                          :type="layout.type"
                          :options="layout.options"
                          :data="state.rootData"
                          :fetch-options="fetchOptions"
                          :type-options="typeOptions"
                          :field-handler="fieldHandler"
                          v-on="getListeners(layout.name, idx)"
        >
            <template v-for="(slot) of state.slotNames"
                      #[slot]="scope"
            >
                <slot :name="`${name}-${slot}`"
                      v-bind="scope"
                />
            </template>
        </p-dynamic-layout>
    </div>
</template>

<script lang="ts" setup>
import { map, replace } from 'lodash';
import {
    computed, reactive, useAttrs, useSlots,
} from 'vue';


import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import type {
    ListDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/list/type';
import type { DynamicLayout, ListOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import { makeByPassListeners } from '@/utils/composition-helpers';

const props = withDefaults(defineProps<ListDynamicLayoutProps>(), {
    options: () => ({}) as ListOptions,
    fetchOptions: undefined,
    typeOptions: undefined,
    fieldHandler: undefined,
});

const slots = useSlots();
const attrs = useAttrs();

const state = reactive({
    layouts: computed<DynamicLayout[]>(() => props.options.layouts || []),
    rootData: computed(() => {
        if (props.options.root_path) {
            return getValueByPath(props.data, props.options.root_path);
        }
        return props.data;
    }),
    slotNames: computed(() => (map<any, string>(slots, (slot: string, name) => replace(name, `${props.name}-`, '')))),
});

const getListeners = (name, idx) => ({
    ...attrs,
    fetch(...args) {
        makeByPassListeners(attrs, 'fetch', ...args, name, idx);
    },
    select(...args) {
        makeByPassListeners(attrs, 'select', ...args, name, idx);
    },
    export() {
        makeByPassListeners(attrs, 'export', name, idx);
    },
});

</script>
