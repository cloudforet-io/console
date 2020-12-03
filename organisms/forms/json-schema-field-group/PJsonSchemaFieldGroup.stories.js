/* eslint-disable camelcase */
import PJsonSchemaFieldGroup from '@/components/organisms/forms/json-schema-field-group/PJsonSchemaFieldGroup.vue';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import md from '@/components/organisms/forms/json-schema-field-group/PJsonSchemaFieldGroup.md';

export default {
    title: 'others/json-schema-field-group',
    component: PJsonSchemaFieldGroup,
    parameters: {
        notes: md,
    },
};
const defaultSchema = {
    type: 'object',
    properties: {
        domain: {
            title: 'Email Domain',
            type: 'string',
            default: 'one@spaceone.dev',
            examples: ['type your email'],
        },
        'not-required': {
            title: 'not-required & placeholder',
            type: 'string',
            examples: ['type your email'],
        },
        number_field: {
            title: 'I am number type',
            type: 'number',
            examples: ['type number'],
        },
        integer_field: {
            title: 'I am integer type',
            type: 'integer',
        },
        boolean_field: {
            title: 'I am boolean type',
            type: 'boolean',
        },
        enum_field: {
            title: 'I am enum Type',
            type: 'string',
            enum: ['hi', 'abcd', 'etc'],
        },
        enum_number_field: {
            title: 'I am enum Type(number)',
            type: 'number',
            enum: [1, 2, 3, 4, 3.14],
        },
        array: {
            title: 'I am Array Type',
            type: 'array',
        },
        number_array: {
            title: 'I am Array(Number) Type',
            type: 'array',
            examples: ['type number'],
            items: {
                type: 'number',
            },
        },
    },
    required: ['domain', 'client_id'],
};

export const defaultCase = () => ({
    components: { PJsonSchemaFieldGroup },
    template: `
    <div class="w-64">
        <PJsonSchemaFieldGroup
                v-for="form in forms"
                :key="form.key"
                v-model="data[form.key]"
                :schema="form.schema"
                :invalid="false"
                :required="form.required"
        />
        <pre>{{data}}</pre>
    </div>
  `,
    setup(props, context) {
        const schema = defaultSchema;
        const data = reactive(_.zipObject(Object.keys(schema.properties)));
        const forms = computed(() => Object.entries(schema.properties).map(([key, value]) => ({
            key,
            schema: value,
            required: schema.required ? schema.required.includes(key) : false,
        })));
        return {
            forms,
            data,
        };
    },
});

export const ignoreSchemaDefaultValue = () => ({
    components: { PJsonSchemaFieldGroup },
    template: `
    <div class="w-64">
        <PJsonSchemaFieldGroup
                v-for="form in forms"
                :key="form.key"
                v-model="data[form.key]"
                :schema="form.schema"
                :invalid="false"
                :required="form.required"
        />
        <pre>{{data}}</pre>
    </div>
  `,
    setup(props, context) {
        const schema = {
            type: 'object',
            properties: {
                default_field: {
                    title: 'Email Domain',
                    type: 'string',
                    default: 'one@spaceone.dev',
                },
                no_default_field: {
                    title: 'No Default',
                    type: 'string',
                },
                force_default_field: {
                    title: 'Force Default',
                    type: 'string',
                    default: "you can't see me",
                },
            },
        };
        const data = reactive({
            default_field: null,
            no_default_field: null,
            force_default_field: 'this is vue default',
        });
        const forms = computed(() => Object.entries(schema.properties).map(([key, value]) => ({
            key,
            schema: value,
            required: schema.required ? schema.required.includes(key) : false,
        })));
        return {
            forms,
            data,
        };
    },
});


export const invalidForm = () => ({
    components: { PJsonSchemaFieldGroup },
    template: `
    <div class="w-64">
        <PJsonSchemaFieldGroup
                v-for="form in forms"
                :key="form.key"
                v-model="data[form.key]"
                :schema="form.schema"
                :invalid="true"
                invalidText="this is invalid text"
                :required="form.required"
        />
        <pre>{{data}}</pre>
    </div>
  `,
    setup(props, context) {
        const schema = defaultSchema;
        const data = reactive(_.zipObject(Object.keys(schema.properties)));

        const forms = computed(() => Object.entries(schema.properties).map(([key, value]) => ({
            key,
            schema: value,
            required: schema.required ? schema.required.includes(key) : false,
        })));
        return {
            forms,
            data,
        };
    },
});
