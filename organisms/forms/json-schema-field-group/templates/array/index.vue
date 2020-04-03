<template>
    <PTagsInput
        :tags.sync="proxyValue"
        class="w-full"
        :placeholder="schema.examples?schema.examples[0]||'':''"
        :invalid="invalid"
    />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { makeVModelProxy } from '@/lib/compostion-util';
import PTagsInput from '@/components/organisms/forms/tags-input/TagsInput.vue';
import _ from 'lodash';


export default defineComponent({
    name: 'ArrayForm',
    components: { PTagsInput },
    model: {
        prop: 'value',
        event: 'input',
    },
    props: {
        invalid: {
            type: Boolean,
            required: true,
        },
        schema: {
            type: Object,
            required: true,
        },
        value: {
            type: Array,
            default: undefined,
        },
    },
    setup(props, context) {
        let proxyValue;
        const arrayType = _.get(props.schema, ['items', 'type']);
        switch (arrayType) {
        case 'integer':
            proxyValue = makeVModelProxy(undefined, undefined, (val: string[]) => val.map((v => parseInt(v))).filter(obj => obj));
            break;
        case 'number':
            proxyValue = makeVModelProxy(undefined, undefined, (val: string[]) => val.map((v => parseFloat(v))).filter(obj => obj));
            break;
        default:
            proxyValue = makeVModelProxy();
        }

        return {
            proxyValue,
        };
    },
});
</script>
