<template>
    <div>
        <p-field-group :label="schema.title"
                       :required="required"
                       :invalid-text="invalidText"
                       :invalid="typeof invalid === 'boolean' ? invalid : false"
        >
            <div class="form-container">
            <component
                    v-model="proxyValue"
                    :is="component"
                    :schema="schema"
                    :invalid="invalid"
                    />
            </div>
        </p-field-group>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase,vue/prop-name-casing,@typescript-eslint/camelcase */
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';

import {
    computed, defineComponent, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { Computed } from '@/lib/type';


interface State {
    component: any;
    loader: Computed<() => Promise<any>>;
    proxyValue:any;
}
export interface JsonFieldSchema {
    type:string
    title:string
}
interface Props{
    key:string
    schema:JsonFieldSchema
    required:boolean
    value: any|undefined
    invalidText: string
    invalid:boolean|undefined
}
export default defineComponent({
    name: 'PJsonSchemaForm',
    model: {
        prop: 'value',
        event: 'input',
    },
    components:{PFieldGroup},
    props: {
        schema: {
            type: Object,
            required: true,
        },
        required: {
            type: Boolean,
            required: false,
        },
        value: {
            default: undefined,
        },
        invalidText: {
            type: String,
            default: '',
        },
        invalid: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props: Props,context) {
        // noinspection TypeScriptCheckImport
        const state = reactive<State>({
            component: null,
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.schema.type}/index.vue`)),
            proxyValue : computed({
                get: () => props.value,
                set: (val) => {
                    context.emit('input', val); // for v-model
                },
            })
        });

        onMounted((): void => {
            // @ts-ignore
            state.loader().then(() => {
                // @ts-ignore
                state.component = () => state.loader();
            })
                .catch(() => {
                    // eslint-disable-next-line import/no-unresolved
                    state.component = () => import('./templates/string/index.vue');
                });
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
    .form-container {
        display: flex;
        width: 100%;
    }
</style>
