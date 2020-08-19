<template>
    <div>
        <p-panel-top v-if="name">
            {{ name }}
        </p-panel-top>
        <p-definition-table :fields="fields" :data="rootData" :loading="loading"
                            v-on="$listeners"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="{...scope, rootData}" />
            </template>
        </p-definition-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { get } from 'lodash';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import { DefinitionData, DefinitionField } from '@/components/organisms/tables/definition-table/type';
import {
    ItemDynamicLayoutProps, ItemFetchOptions,
} from '@/components/organisms/dynamic-layout/templates/item/type';

export default {
    name: 'PDynamicLayoutItem',
    components: {
        PPanelTop,
        PDefinitionTable,
    },
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
            type: Object,
            default: undefined,
        },
        fetchOptions: {
            type: Object,
            default: undefined,
        },
        extra: {
            type: Object,
            default: undefined,
        },
    },
    setup(props: ItemDynamicLayoutProps, { emit }) {
        const state = reactive({
            fields: computed<DefinitionField[]>(() => {
                if (!props.options.fields) return [];
                return props.options.fields.map(d => ({
                    label: d.name, name: d.key, type: d.type, options: d.options,
                } as DefinitionField));
            }),
            rootData: computed<DefinitionData>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path);
                }
                return props.data;
            }),
            loading: computed(() => (props.extra === undefined ? undefined : props.extra.loading)),
            fetchOptionsParam: computed<ItemFetchOptions>(() => ({})),
        });

        emit('init', state.fetchOptionsParam);

        return {
            ...toRefs(state),
        };
    },
};
</script>
