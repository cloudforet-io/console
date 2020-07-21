/* eslint-disable camelcase */
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import {
    CustomKeywords,
    CustomValidator,
    JsonSchemaFormToolSet,
} from '@/components/organisms/forms/json-schema-form/toolset';
import { JsonSchemaObjectType } from '@/components/util/type';

export default {
    title: 'organisms/forms/json-schema-form',
    component: PJsonSchemaForm,
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
            default: 1,
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
    required: ['domain', 'not-required', 'number_field', 'integer_field'],
};

export const defaultCase = () => ({
    components: { PJsonSchemaForm, PButton },
    template: `
    <div class="w-64">
        <PJsonSchemaForm
          v-bind="jscTS.state"
          :item.sync="jscTS.syncState.item" 
        />
        <PButton style-type="primary" @click="jscTS.formState.validator()"> Validate!</PButton>
        <pre>{{jscTS.syncState.item}}</pre>
    </div>
  `,
    setup(props, context) {
        const jscTS = new JsonSchemaFormToolSet();
        jscTS.setProperty(defaultSchema);
        return {
            jscTS,
        };
    },
});

export const customSchemaForm = () => ({
    components: { PJsonSchemaForm, PButton },
    template: `
    <div class="w-64">
        <PJsonSchemaForm
          v-bind="jscTS.state"
          :item.sync="jscTS.syncState.item" 
        />
        <PButton style-type="primary" @click="jscTS.formState.validator()"> Validate!</PButton>
        <pre>{{jscTS.syncState.item}}</pre>
    </div>
  `,
    setup(props, context) {
        const jscTS = new JsonSchemaFormToolSet();
        const schema = new JsonSchemaObjectType();
        schema.addStringProperty('name', 'Name', true);
        schema.addStringProperty('email', 'EMail', true);

        jscTS.setProperty(schema, ['name', 'email']);
        return {
            jscTS,
        };
    },
});

export const customValidatorForm = () => ({
    components: { PJsonSchemaForm, PButton },
    template: `
    <div class="w-64">
        <PJsonSchemaForm
          v-bind="jscTS.state"
          :item.sync="jscTS.syncState.item" 
        />
        <PButton style-type="primary" @click="jscTS.formState.validator()"> Validate!</PButton>
        <pre>{{jscTS.syncState.item}}</pre>
    </div>
  `,
    setup(props, context) {
        const jscTS = new JsonSchemaFormToolSet();
        const checkEmail = (...args) => {
            const prom = new Promise((resolve, reject) => {
                const data = args[1] || '';
                // console.debug(data.indexOf('@'));
                if (data.indexOf('@') !== -1) {
                    resolve(true);
                }
                resolve(false);
            });
            return prom;
        };

        const validation = {
            isEmail: new CustomValidator(checkEmail, 'is it email?'),
        };
        const schema = new JsonSchemaObjectType(undefined, undefined, true);
        schema.addStringProperty('name', 'Name', true);
        schema.addStringProperty('emailDomain', 'EMail Domain', true, 'you start @ text', { isEmail: true });

        jscTS.setProperty(schema, ['name', 'emailDomain'], validation);
        return {
            jscTS,
        };
    },
});
