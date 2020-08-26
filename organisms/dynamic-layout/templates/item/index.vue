<template>
    <div>
        <p-panel-top v-if="name">
            {{ name }}
        </p-panel-top>
        <p-definition-table :fields="fields" :data="rootData" :loading="loading"
                            v-on="$listeners"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps">
                    <p-dynamic-field :key="slotName" v-bind="item" :data="slotProps.data"
                                     :before-create="beforeCreateField"
                                     :handler="fieldHandler"
                    />
                </slot>
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
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicField } from '@/components/organisms/dynamic-field/type/field-schema';

export default {
    name: 'PDynamicLayoutItem',
    components: {
        PDynamicField,
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
            type: [Object, Array],
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
        beforeCreateField: {
            type: Function,
            default: undefined,
        },
        fieldHandler: {
            type: Function,
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
                    return get(props.data, props.options.root_path, {});
                }
                if (Array.isArray(props.data)) return {};
                return props.data;
            }),
            loading: computed(() => (props.typeOptions === undefined ? undefined : props.typeOptions.loading)),
            fetchOptionsParam: computed<ItemFetchOptions>(() => ({})),
        });

        const dynamicFieldSlots = computed((): Record<string, DynamicFieldProps> => {
            const res = {};
            if (!props.options.fields) return res;

            // Do NOT move this code to inside the forEach callback. This code let 'computed' track 'props.typeOptions'.
            const timezone = props.typeOptions?.timezone || 'UTC';

            props.options.fields.forEach((ds: DynamicField, i) => {
                const item: Omit<DynamicFieldProps, 'data'> = {
                    type: ds.type || 'text',
                    options: ds.options || {},
                    extraData: ds,
                };

                if (ds.type === 'datetime') {
                    item.typeOptions = { timezone };
                }
                res[`data-${ds.key}`] = item;
            });

            return res;
        });

        emit('init', state.fetchOptionsParam);

        return {
            ...toRefs(state),
            dynamicFieldSlots,
        };
    },
};
</script>
