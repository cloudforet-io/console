<template>
    <p-text-input v-if="['number','integer'].includes(schema.type)"
                  v-model.number="proxyValue"
                  type="number"
                  :class="{'is-invalid': typeof invalid === 'boolean' ? invalid : false}"
                  class="w-full"
                  :placeholder="schema.examples?schema.examples[0]||'':''"
    />
    <p-text-input v-else
                  v-model.trim="proxyValue"
                  :class="{'is-invalid': typeof invalid === 'boolean' ? invalid : false}"
                  class="w-full"
                  :placeholder="schema.examples?schema.examples[0]||'':''"
    />
</template>

<script lang="ts">
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { makeVModelProxy } from '@/components/util/composition-helpers';

export default {
    name: 'StringForm',
    components: { PTextInput },
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
            default: undefined,
        },
    },
    setup(props) {
        let proxyValue;
        switch (props.schema.type) {
        case 'integer':
            proxyValue = makeVModelProxy(undefined, undefined, (val: any) => parseInt(val));
            break;
        default:
            proxyValue = makeVModelProxy();
        }
        return {
            proxyValue,
            numberFilter(val) {
                return props.schema.type === 'integer' ? Math.floor(val) : val;
            },
        };
    },
};
</script>
