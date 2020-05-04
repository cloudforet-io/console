<template>
    <fragment>
        <PJsonSchemaFieldGroup
            v-for="field in properties"
            :key="field.key"
            :value="item[field.key]"
            :schema="field.schema"
            :invalid="invalidState[field.key]||false"
            :invalid-text="invalidText[field.key]||''"
            :required="field.required||false"
            @input="updateData(field.key,$event)"
        />
    </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { JsonSchemaFormProps, JsonSchemaProperty } from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaFieldGroup from '@/components/organisms/forms/json-schema-field-group/JsonSchemaFieldGroup.vue';
import _ from 'lodash';

export default {
    name: 'PJsonSchemaForm',
    components: { Fragment, PJsonSchemaFieldGroup },
    props: {
        item: {
            type: Object,
            default: undefined,
        },
        properties: {
            type: Array,
            default: (): JsonSchemaProperty[] => ([]),
        },
        invalidText: {
            type: Object,
            default: () => ({}),
        },
        invalidState: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: JsonSchemaFormProps, context) {
        let buffer = {};
        const emitData = _.debounce(() => {
            context.emit('update:item', { ...props.item, ...buffer });
            buffer = {};
        }, 30);

        const updateData = (key, val) => {
            buffer[key] = val;
            emitData();
        };

        return {
            updateData,
        };
    },
};
</script>
