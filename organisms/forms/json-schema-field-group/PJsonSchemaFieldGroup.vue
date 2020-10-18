<template>
    <div>
        <p-field-group :label="schema.title"
                       :required="required"
                       :invalid-text="invalidText"
                       :invalid="typeof invalid === 'boolean' ? invalid : false"
        >
            <div class="form-container">
                <component
                    :is="component"
                    v-model="proxyValue"
                    :schema="schema"
                    :invalid="invalid"
                />
            </div>
        </p-field-group>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase,vue/prop-name-casing,@typescript-eslint/camelcase */
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';

import {
    computed, defineComponent, onMounted, reactive, toRefs, UnwrapRef,
} from '@vue/composition-api';
import { Computed } from '@/components/util/type';


interface State {
    component: any;
    loader: Computed<() => Promise<any>>;
    proxyValue: any;
    type: string;
}
export interface JsonFieldSchema {
    type: string;
    title: string;
    default?: any;
}
interface Props{
    key: string;
    schema: JsonFieldSchema;
    required: boolean;
    value: any|undefined;
    invalidText: string;
    invalid: boolean|undefined;
}
export default defineComponent({
    name: 'PJsonSchemaFieldGroup',
    model: {
        prop: 'value',
        event: 'input',
    },
    components: { PFieldGroup },
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
    setup(props: Props, context) {
        // noinspection TypeScriptCheckImport
        const state: UnwrapRef<State> = reactive({
            component: null,
            type: computed<string>(() => {
                if (Object.prototype.hasOwnProperty.call(props.schema, 'enum')) {
                    return 'enum';
                } if (['string', 'number', 'integer'].includes(props.schema.type)) {
                    return 'text';
                }
                return props.schema.type;
            }),
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${state.type}/index.vue`)),
            proxyValue: computed({
                get: () => props.value,
                set: (val) => {
                    context.emit('input', val); // for v-model
                },
            }),
        });

        onMounted((): void => {
            // @ts-ignore
            state.loader().then(() => {
                // @ts-ignore
                state.component = () => state.loader();
            })
                .catch(() => {
                    // eslint-disable-next-line import/no-unresolved
                    state.component = () => import('./templates/text/index.vue');
                });
            if (!['boolean', 'string', 'number'].includes(typeof state.proxyValue) && Object.prototype.hasOwnProperty.call(props.schema, 'default')) {
                state.proxyValue = props.schema.default;
            }
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
