<template>
    <component :is="component"
               :name="name"
               :options="options"
               :data="data"
               :fetch-options="fetchOptions"
               :type-options="typeOptions"
               :field-handler="fieldHandler"
               v-on="$listeners"
    >
        <template v-for="(_, slot) of $scopedSlots" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
        </template>
    </component>
</template>

<script lang="ts">
import {
    defineComponent,
    onMounted, reactive, toRefs, watch,
} from 'vue';
import type { AsyncComponent } from 'vue';
import type { ImportedComponent } from 'vue/types/options';

import { isEqual } from 'lodash';

import type { DynamicLayoutType } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { dynamicLayoutTypes } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';

const componentMap: Record<DynamicLayoutType, AsyncComponent> = {
    item: () => ({
        component: import('./templates/item/index.vue') as Promise<ImportedComponent>,
    }),
    'simple-table': () => ({
        component: import('./templates/simple-table/index.vue') as Promise<ImportedComponent>,
    }),
    table: () => ({
        component: import('./templates/table/index.vue') as Promise<ImportedComponent>,
    }),
    'query-search-table': () => ({
        component: import('./templates/query-search-table/index.vue') as Promise<ImportedComponent>,
    }),
    raw: () => ({
        component: import('./templates/raw/index.vue') as Promise<ImportedComponent>,
    }),
    markdown: () => ({
        component: import('./templates/markdown/index.vue') as Promise<ImportedComponent>,
    }),
    list: () => ({
        component: import('./templates/list/index.vue') as Promise<ImportedComponent>,
    }),
    'raw-table': () => ({
        component: import('./templates/raw-table/index.vue') as Promise<ImportedComponent>,
    }),
    html: () => ({
        component: import('./templates/html/index.vue') as Promise<ImportedComponent>,
    }),
    popup: () => ({
        component: import('./templates/popup/index.vue') as Promise<ImportedComponent>,
    }),
};
export default defineComponent({
    name: 'PDynamicLayout',
    components: { PSkeleton },
    props: {
        name: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: 'item',
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
    setup(props) {
        const state = reactive({
            component: null as null|AsyncComponent,
        });

        const getComponent = async () => {
            try {
                if (!dynamicLayoutTypes.includes(props.type)) throw new Error(`[DynamicLayout] Unacceptable Type: layout type must be one of ${dynamicLayoutTypes}. ${props.type} is not acceptable.`);

                state.component = componentMap[props.type];
            } catch (e) {
                console.error(e);
                state.component = componentMap.item;
            }
        };

        watch([() => props.type, () => props.name], (aft, bef) => {
            if (!isEqual(aft, bef)) {
                getComponent();
            }
        }, { immediate: false });

        onMounted(async () => {
            await getComponent();
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>
