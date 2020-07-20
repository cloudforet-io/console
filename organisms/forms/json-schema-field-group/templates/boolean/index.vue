<template>
    <div class="w-full">
        <span v-for="(bool) in [true, false]" :key="bool" :class="{'is-invalid-radio':invalid}">
            <p-radio v-model="proxyValue" :value="bool" /> {{ bool }}
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import { makeVModelProxy } from '@/lib/compostion-util';

export default defineComponent({
    name: 'BooleanForm',
    components: { PRadio },
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
    setup(props, context) {
        return {
            proxyValue: makeVModelProxy(),
        };
    },

});
</script>

<style lang="postcss">
.is-invalid-radio{
    @apply text-red;
}
</style>
