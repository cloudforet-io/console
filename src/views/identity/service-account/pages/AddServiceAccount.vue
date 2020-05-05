<template>
    <general-page-layout>
        <PPageTitle
            class="mb-6 mt-2"
            title="Add Service Account"
        />
        <p-pane-layout class="w-full px-4 py-8">
            <PJsonSchemaForm v-bind="fixFormTS.state" :item.sync="fixFormTS.syncState.item" />
            <PJsonSchemaForm v-bind="jscTS.state" :item.sync="jscTS.syncState.item" />
            <PFieldGroup
                label="Tags"
            >
                <p-dict-input-group
                    v-bind="tagsTS.state"
                    :items.sync="tagsTS.syncState.items"
                    :show-header="true"
                    v-on="tagsTS.events"
                >
                    <template #addButton="scope">
                        <p-icon-text-button
                            outline style-type="primary" :disabled="scope.disabled"
                            name="ic_plus_bold"
                            @click="scope.addPair($event)"
                        >
                            {{ $t('BTN.ADD_TAG') }}
                        </p-icon-text-button>
                    </template>
                </p-dict-input-group>
            </PFieldGroup>
        </p-pane-layout>
        <div class="buttons">
            <p-button outline style-type="primary-dark" @click="onCancel">
                {{ $t('BTN.CANCEL') }}
            </p-button>
            <p-button style-type="primary" @click="confirm">
                {{ $t('BTN.SAVE') }}
            </p-button>
        </div>
    </general-page-layout>
</template>
<script lang="ts">

import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import {
    makeProxy,
} from '@/lib/compostion-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import {
    CustomKeywords,
    JsonSchemaFormToolSet,
    CustomValidator,
} from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/JsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';
import { fluentApi } from '@/lib/fluent-api';
import {
    getCurrentInstance, onMounted, reactive, watch,
} from '@vue/composition-api';
import { AxiosResponse } from 'axios';
import Ajv from 'ajv';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';

export default {
    name: 'SSecretCreateFormModal',
    components: {
        PPageTitle,
        PFieldGroup,
        PDictInputGroup,
        PJsonSchemaForm,
        PPaneLayout,
        GeneralPageLayout,
        PIconTextButton,

        PButton,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        provider: {
            type: String,
            default: null,
        },
    },
    setup(props, context) {
        const tagsTS = new DictIGToolSet({
            showValidation: true,
        });
        const vm = getCurrentInstance();
        const fixFormTS = new JsonSchemaFormToolSet();
        const state = reactive({
            schemaNames: [] as string[],
            formSchema: {},
        });

        const checkNameUnique = (...args: any[]) => fluentApi.secret().secret().list()
            .setFilter({ key: 'name', operator: '=', value: args[1] })
            .setCountOnly()
            .execute()
            .then(resp => resp.data.total_count === 0);

        const validation: CustomKeywords = {
            uniqueName: new CustomValidator(checkNameUnique, 'name is duplicated'),
        };

        const makeFixSchema = () => {
            const sch = new JsonSchemaObjectType(undefined, undefined, true);
            sch.addStringProperty('name', 'Name', true, undefined, { uniqueName: true });
            sch.addEnumProperty('schemaName', 'Secret Type', state.schemaNames, true, { default: state.schemaNames[0] });
            return sch;
        };
        watch(() => state.schemaNames, (after, before) => {
            if (after !== before) {
                const sch = makeFixSchema();
                fixFormTS.setProperty(sch, ['name', 'schemaName'], validation);
                fixFormTS.syncState.item.schemaName = state.schemaNames[0];
            }
        });


        const jscTS = new JsonSchemaFormToolSet();
        const getSchema = async (name) => {
            if (name) {
                const resp: AxiosResponse<any> = await fluentApi.repository().schema().getByName().setId(name)
                    .execute();
                jscTS.setProperty(resp.data.schema);
            }
        };

        watch(() => fixFormTS.syncState.item, async (after, before) => {
            if (after.schemaName && after.schemaName !== before.schemaName) {
                await getSchema(after.schemaName);
            }
        });
        onMounted(async () => {
            const resp = await fluentApi.identity().provider().get().setId(props.provider)
                .setOnly('template.service_account.schema', 'capability.supported_schema')
                .execute();
            state.formSchema = resp.data.template.service_account.schema;
            state.schemaNames = resp.data.capability.supported_schema;
        });
        const onCancel = () => {
            const nextPath = vm?.$route.query.nextPath as string|undefined;
            if (nextPath) {
                vm?.$router.push(nextPath);
            } else {
                vm?.$router.back();
            }
        };

        const confirm = async () => {
            const fixFormValid = await fixFormTS.formState.validator();
            const jscFormValid = await jscTS.formState.validator();
            if (tagsTS.allValidation() && fixFormValid && jscFormValid) {
                const item = {
                    name: fixFormTS.syncState.item.name,
                    data: jscTS.syncState.item,
                    tags: tagsTS.vdState.newDict,
                };
                context.emit('confirm', item);
            }
        };

        return {
            tagsTS,
            jscTS,
            fixFormTS,
            confirm,
            onCancel,
        };
    },
};
</script>
