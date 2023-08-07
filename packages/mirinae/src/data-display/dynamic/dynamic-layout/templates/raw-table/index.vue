<template>
    <p-dynamic-layout-table class="p-dynamic-layout-raw-table"
                            type="raw-table"
                            :name="name"
                            :options="{
                                fields: state.fields,
                                translation_id: options.translation_id,
                                disable_search: options.disable_search,
                            }"
                            :data="state.rootData"
                            :fetch-options="fetchOptions"
                            :type-options="typeOptions"
                            :field-handler="fieldHandler"
                            v-on="listeners"
    >
        <template v-for="(_, slot) of slots"
                  #[slot]="scope"
        >
            <slot :name="slot"
                  v-bind="scope"
            />
        </template>
    </p-dynamic-layout-table>
</template>

<script setup lang="ts">
import {
    computed, reactive, useAttrs, useSlots,
} from 'vue';

import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type { RawTableDynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/templates/raw-table/type';
import PDynamicLayoutTable from '@/data-display/dynamic/dynamic-layout/templates/table/index.vue';
import { getValueByPath } from '@/data-display/dynamic/helper';
import { getSortingData } from '@/utils';

const props = withDefaults(defineProps<RawTableDynamicLayoutProps>(), {
    name: '',
    options: () => ({}),
});
const attrs = useAttrs();
const slots = useSlots();

const state = reactive({
    fields: computed<DynamicField[]>(() => {
        const firstItem = state.rootData[0];
        if (firstItem) {
            if (Array.isArray(props.options?.headers) && props.options?.headers?.length) {
                return props.options.headers.map((value) => ({ key: value, name: value } as DynamicField));
            }
            return getSortingData(Object.keys(firstItem)).map((value) => ({ key: value, name: value } as DynamicField));
        }
        return [];
    }),
    rootData: computed<any[]>(() => {
        if (props.options.root_path) {
            const rootData = getValueByPath(props.data, props.options.root_path) ?? [];
            return Array.isArray(rootData) ? rootData : [rootData];
        }
        if (Array.isArray(props.data)) return props.data;
        return [];
    }),
});

const listeners = {
    ...attrs,
};

</script>
