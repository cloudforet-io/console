<template>
    <div>
        <p-panel-top v-if="name">
            {{ name }}
        </p-panel-top>
        <p-definition-table :fields="fields" :data="rootData" :loading="loading"
                            v-on="$listeners"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="slotProps">
                <p-dynamic-field :key="slotName" v-bind="item"
                                 :data="slotProps.data"
                                 :before-create="beforeCreateField"
                                 :handler="fieldHandler"
                />
            </template>
        </p-definition-table>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
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
import { DynamicField, ListOptions } from '@/components/organisms/dynamic-field/type/field-schema';

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
    setup(props: ItemDynamicLayoutProps, { emit, refs }) {
        const state = reactive({
            fields: computed<DefinitionField[]>(() => {
                if (!props.options.fields) return [];
                return props.options.fields.map((d, i) => {
                    const res = {
                        label: d.name, name: d.key,
                    } as DefinitionField;

                    // in case of type 'list', it generate html elements recursively.
                    // it can cause definition's 'showCopy'(flag for showing or not copy button) works wrong.
                    // so should check there is copiable value, and give the result to each field's 'disableCopy' property.
                    if (d.type === 'list') {
                        const subKey = (d.options as ListOptions).sub_key as string;
                        const matchedData = get(state.rootData, d.key);
                        if (Array.isArray(matchedData)) {
                            res.disableCopy = matchedData.some(data => !get(data, subKey));
                        } else {
                            res.disableCopy = !get(matchedData, subKey);
                        }
                    }
                    return res;
                });
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
            timezone: computed(() => props.typeOptions?.timezone || 'UTC'),
        });

        const dynamicFieldSlots = computed(() => {
            const res = {};
            if (!props.options.fields) return res;

            props.options.fields.forEach((ds: DynamicField, i) => {
                const item: Omit<DynamicFieldProps, 'data'> = {
                    type: ds.type || 'text',
                    options: ds.options || {},
                    extraData: { ...ds, index: i },
                };

                if (ds.type === 'datetime') {
                    item.typeOptions = { timezone: state.timezone };
                }

                res[`data-${i}`] = item;
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
