<template>
    <p-text-input
            v-model="proxyValue"
            :class="{'is-invalid': typeof invalid === 'boolean' ? invalid : false}"
            class="w-full"
    />
</template>

<script lang="ts">
import {computed, defineComponent} from "@vue/composition-api";

export default defineComponent({
    name: 'stringForm',
    model: {
        prop: 'value',
        event: 'input',
    },
    props:{
        invalid:{
            type:Boolean,
            required:true,
        },
        schema:{
            type:Object,
            required:true,
        },
        value: {
            default: undefined,
        },
    },
    setup(props,context){
        return{
            proxyValue: computed({
                get: () => props.value,
                set: (val) => {
                    context.emit('input', val); // for v-model
                },
            })
        }
    }

})
</script>
