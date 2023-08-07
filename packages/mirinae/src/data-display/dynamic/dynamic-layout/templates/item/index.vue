<template>
    <div>
        <p-heading v-if="state.layoutName"
                   heading-type="sub"
        >
            {{ state.layoutName }}
        </p-heading>
        <p-definition-table :fields="state.fields"
                            :data="state.rootData"
                            :loading="state.loading"
                            v-on="listeners"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots"
                      :key="slotName"
                      #[slotName]
            >
                <p-dynamic-field v-bind="item"
                                 :handler="fieldHandler"
                />
            </template>
        </p-definition-table>
    </div>
</template>

<script lang="ts" setup>
import {
    computed, reactive, useAttrs,
} from 'vue';
import { useI18n } from 'vue-i18n';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type { ItemDynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/templates/item/type';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import PDefinitionTable from '@/data-display/tables/definition-table/PDefinitionTable.vue';
import type { DefinitionData, DefinitionField } from '@/data-display/tables/definition-table/type';

const props = withDefaults(defineProps<ItemDynamicLayoutProps>(), {
    options: () => ({}) as ItemDynamicLayoutProps['options'],
});

const { t, locale } = useI18n();
const attrs = useAttrs();

const state = reactive({
    layoutName: computed(() => (props.options.translation_id ? t(props.options.translation_id) : props.name)),
    fields: computed<DefinitionField[]>(() => {
        if (!props.options.fields) return [];
        return props.options.fields.map((d) => ({
            label: d.options?.translation_id ? t(d.options.translation_id as string, locale.value) : d.name,
            name: d.key,
            disableCopy: !!d.options?.disable_copy,
        } as DefinitionField));
    }),
    rootData: computed<DefinitionData>(() => {
        if (props.options.root_path) {
            return getValueByPath(props.data, props.options.root_path) ?? {};
        }
        if (Array.isArray(props.data) || typeof props.data === 'string') return {};
        return props.data;
    }),
    loading: computed<boolean|undefined>(() => (props.typeOptions === undefined ? undefined : props.typeOptions.loading)),
    timezone: computed<string>(() => props.typeOptions?.timezone || 'UTC'),
});

const getFieldData = (rootData, dataPath: string, type?: string): any => {
    if (type === 'more') {
        return rootData;
    }
    return getValueByPath(rootData, dataPath);
};

const dynamicFieldSlots = computed(() => {
    const res = {};
    if (!props.options.fields) return res;

    props.options.fields.forEach((ds: DynamicField, i) => {
        const item: DynamicFieldProps = {
            type: ds.type || 'text',
            options: { ...ds.options },
            extraData: { ...ds, index: i },
            data: getFieldData(state.rootData, ds.key, ds.type),
        };

        if (item.options.translation_id) delete item.options.translation_id;

        if (ds.type === 'datetime') {
            item.typeOptions = { timezone: state.timezone };
        } else if (ds.type === 'more') {
            item.typeOptions = { displayKey: ds.key };
        }

        res[`data-${i}`] = item;
    });

    return res;
});

const listeners = {
    ...attrs,
};

</script>
