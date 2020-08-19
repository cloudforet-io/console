<template>
    <div class="all-container">
        <div class="area collector-info">
            <p-lazy-img class="flex-shrink-0 mr-8"
                        :img-url="imgUrl"
                        width="5.5rem" height="5.5rem"
            />
            <div class="flex-grow">
                <p-json-schema-form v-bind="fixedFormTS.state"
                                    :item.sync="fixedFormTS.syncState.item"
                                    @change="onChangeFixedForm"
                />
            </div>
        </div>
        <div v-if="showOptions" class="area options">
            <p class="sub-title">
                {{ $t('INVENTORY.OPTIONS') }}
            </p>
            <p-json-schema-form v-bind="optionsFormTS.state"
                                :item.sync="optionsFormTS.syncState.item"
                                @change="onChangeOptionsForm"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, watch, Ref,
} from '@vue/composition-api';
import {
    get, forEach, set, every, debounce,
} from 'lodash';
import { makeProxy } from '@/lib/compostion-util';

import { fluentApi } from '@/lib/fluent-api';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import { JsonSchemaFormToolSet } from '@/components/organisms/forms/json-schema-form/toolset';
import { JsonSchemaObjectType } from '@/lib/type';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { showErrorMessage } from '@/lib/util';

const DEFAULT_PRIORITY = 10;
export interface Form {
    name: string;
    priority: number;
    // eslint-disable-next-line camelcase
    plugin_info: {
        // eslint-disable-next-line camelcase
        plugin_id: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: any;
        version: string;
    };
}

interface State {
    showOptions: boolean;
    proxyForm: Form;
}

interface Props {
    enableValidation: boolean;
    isValid: boolean;
    pluginId: string;
    form: Form;
    imgUrl: string;
    optionsSchema: JsonSchemaObjectType;
}

export default {
    name: 'ConfigureCollector',
    components: {
        PJsonSchemaForm,
        PLazyImg,
    },
    props: {
        enableValidation: {
            type: Boolean,
            default: false,
        },
        pluginId: {
            type: String,
            required: true,
        },
        imgUrl: {
            type: String,
            default: '',
        },
        /**
         * sync
         */
        form: {
            type: Object,
            default: (): Form => ({} as Form),
        },
        /**
         * sync
         */
        isValid: {
            type: Boolean,
            default: false,
        },
        optionsSchema: {
            type: Object,
            default: null,
        },
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setup(props: Props, { emit, root }) {
        // set fixedFormTS
        const fixedFormTS = new JsonSchemaFormToolSet();
        const schema = new JsonSchemaObjectType();
        schema.addStringProperty('name', 'Name', true);
        schema.addIntegerProperty('priority', 'Priority', true, '1 ~ 10', {
            default: props.form.priority || DEFAULT_PRIORITY,
            minimum: 1,
            maximum: 10,
        });
        schema.addEnumProperty('plugin_info.version', 'Version', [], true);
        fixedFormTS.setProperty(schema, ['name', 'priority', 'plugin_info.version']);

        // set optionsFormTS
        const optionsFormTS = new JsonSchemaFormToolSet();

        const state: UnwrapRef<State> = reactive({
            showOptions: computed<boolean>(() => optionsFormTS.state.properties.length > 0),
            proxyForm: makeProxy<Form>('form', props, emit),
        });

        const init = (initForm: Form): void => {
            const newForm: Form = {
                name: get(initForm, 'name', ''),
                priority: get(initForm, 'priority', DEFAULT_PRIORITY),
                // eslint-disable-next-line camelcase
                plugin_info: {
                    // eslint-disable-next-line camelcase
                    plugin_id: get(initForm, 'plugin_info.plugin_id', ''),
                    options: get(initForm, 'plugin_info.options', {}),
                    version: get(initForm, 'plugin_info.version', ''),
                },
            };

            // init fixedFormTS
            fixedFormTS.syncState.item.name = newForm.name;
            fixedFormTS.syncState.item.priority = newForm.priority;
            fixedFormTS.syncState.item['plugin_info.version'] = newForm.plugin_info.version;
            forEach(fixedFormTS.state.invalidState, (v, k, origin) => {
                origin[k] = false;
            });

            // init optionsFormTS
            optionsFormTS.syncState.item = newForm.plugin_info.options;
            forEach(optionsFormTS.state.invalidState, (v, k, origin) => {
                origin[k] = false;
            });
            state.proxyForm = newForm;
        };
        init(state.proxyForm);

        const allValid: Readonly<Ref<boolean>> = computed(
            () => every(fixedFormTS.state.invalidState, v => !v)
                && every(optionsFormTS.state.invalidState, v => !v),
        );


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateFormAndValidateField = async (key: string, val: any, isOption = false): Promise<void> => {
            const ts = isOption ? optionsFormTS : fixedFormTS;
            const valueKey = isOption ? `plugin_info.options.${key}` : key;

            if (key === 'plugin_info.version') {
                // eslint-disable-next-line no-param-reassign
                val = `${parseFloat(val)}`;
            }
            set(props.form, valueKey, val);
            state.proxyForm = { ...state.proxyForm };
            if (props.enableValidation) {
                await ts.formState.fieldValidator(key);
                emit('update:isValid', allValid.value);
            }
        };
        const validators = {
            async validate(): Promise<void> {
                await fixedFormTS.formState.validator();
                await optionsFormTS.formState.validator();
                emit('update:isValid', allValid.value);
            },
            onChangeFixedForm: debounce(async (key, val) => {
                await updateFormAndValidateField(key, val);
            }, 300),
            onChangeOptionsForm: debounce(async (key, val) => {
                await updateFormAndValidateField(key, val, true);
            }, 300),
        };

        const pluginApi = fluentApi.repository().plugin();

        const getVersions = async (): Promise<void> => {
            try {
                const res = await pluginApi.getVersions().setId(props.pluginId).execute();
                fixedFormTS.formState.objectSchema.properties['plugin_info.version'].enum = res.data.results;
                res.data.results[0] = `${res.data.results[0]} (latest)`;
                if (!fixedFormTS.syncState.item['plugin_info.version']) {
                    fixedFormTS.syncState.item = {
                        ...fixedFormTS.syncState.item,
                        'plugin_info.version': res.data.results[0],
                    };
                    await updateFormAndValidateField('plugin_info.version', res.data.results[0]);
                }
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Versions', e, root);
            }
        };

        watch(() => props.pluginId, (val) => {
            if (val) getVersions();
        });

        watch(() => props.optionsSchema, (val) => {
            if (val) {
                optionsFormTS.setProperty(val);
                init(state.proxyForm);
            }
        });


        return {
            ...toRefs(state),
            fixedFormTS,
            optionsFormTS,
            ...validators,
            init,
        };
    },
};
</script>

<style lang="postcss" scoped>
.all-container {
    @apply flex;
    padding: 2.4rem 0;
}
.area {
    padding: 0 2.5rem;
    margin: unset;
    width: unset;
}
.collector-info {
    @apply flex-grow-0 flex border-r border-gray-200;
    flex-basis: 50% ;
    .name {
        font-size: 1.125rem;
        padding-bottom: 1rem;
    }
}
.options {
    @apply flex-grow;
}
.sub-title {
    @apply text-gray-400;
    font-weight: bold;
    font-size: 0.875rem;
    line-height: 1rem;
    padding-bottom: 1rem;
}
</style>
