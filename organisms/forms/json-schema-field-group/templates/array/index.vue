<template>
    <p-tags-input
        :tags.sync="proxyValue"
        class="w-full"
        :placeholder="schema.examples?schema.examples[0]||'':''"
        :invalid="invalid"
    />
</template>

<script lang="ts">
import PTagsInput from '@/components/organisms/forms/tags-input/PTagsInput.vue';
import { get } from 'lodash';
import { makeVModelProxy } from '@/components/util/composition-helpers';


export default {
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
        const arrayType = get(props.schema, ['items', 'type']);
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
};
</script>
