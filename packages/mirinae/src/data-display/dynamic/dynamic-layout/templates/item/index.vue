<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type { DynamicLayoutBaseProps, DynamicLayoutFieldHandler, DynamicLayoutTypeOptions } from '@/data-display/dynamic/dynamic-layout/type';
import type { ItemOptions, DynamicLayoutType } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';
import PDefinitionTable from '@/data-display/tables/definition-table/PDefinitionTable.vue';
import type { DefinitionData, DefinitionField } from '@/data-display/tables/definition-table/type';
import { I18nConnector } from '@/translations';

// NOTE: Due to the vue version issue of mirinae, it is not possible to define a type with generics using defineProps.
interface Props extends DynamicLayoutBaseProps {
    name: string;
    type: DynamicLayoutType;
    options: ItemOptions;
    data?: any;
    typeOptions?: DynamicLayoutTypeOptions;
    fieldHandler?: DynamicLayoutFieldHandler;
}

const props = withDefaults(defineProps<Props>(), {
    options: () => ({}) as ItemOptions,
    data: () => ({}),
    typeOptions: () => ({}),
    fieldHandler: undefined,
});

const state = reactive({
    layoutName: computed(() => (props.options.translation_id ? I18nConnector.i18n.t(props.options.translation_id) : props.name)),
    fields: computed<DefinitionField[]>(() => {
        if (!props.options.fields) return [];
        const locale = I18nConnector.i18n.locale;
        return props.options.fields.map((d) => ({
            label: d.options?.translation_id ? I18nConnector.i18n.t(d.options.translation_id as string, locale) : d.name,
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

const dynamicFieldSlots = computed<Record<string, DynamicFieldProps>>(() => {
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

</script>
<template>
    <div>
        <p-heading v-if="state.layoutName"
                   class="pt-8 px-4 pb-4"
                   heading-type="sub"
        >
            {{ state.layoutName }}
        </p-heading>
        <p-definition-table :fields="state.fields"
                            :data="state.rootData"
                            :style-type="options.styleType ?? DEFINITION_TABLE_STYLE_TYPE.primary"
                            :loading="state.loading"
                            v-on="$listeners"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots"
                      #[slotName]
            >
                <p-dynamic-field :key="slotName"
                                 v-bind="item"
                                 :data="item.data"
                                 :handler="fieldHandler"
                />
            </template>
            <template v-for="(_, slot) of $scopedSlots"
                      #[slot]="scope"
            >
                <slot v-if="!dynamicFieldSlots[slot]"
                      :name="slot"
                      v-bind="scope"
                />
            </template>
        </p-definition-table>
    </div>
</template>
