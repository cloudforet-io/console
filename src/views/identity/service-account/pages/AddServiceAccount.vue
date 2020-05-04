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
                    class="w-full bg-primary4 border-gray-200 border-gray-200 p-2"
                    v-bind="tagsTS.state"
                    :items.sync="tagsTS.syncState.items"
                    v-on="tagsTS.events"
                />
            </PFieldGroup>
        </p-pane-layout>
        <div class="buttons">
            <p-button outline style-type="primary-dark" @click="goBack">
                {{ $t('BTN.CANCEL') }}
            </p-button>
            <p-button style-type="primary" @click="onSave">
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
import { watch } from '@vue/composition-api';
import { AxiosResponse } from 'axios';
import Ajv from 'ajv';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PButton from '@/components/atoms/buttons/Button.vue';

export default {
    name: 'SSecretCreateFormModal',
    components: {
        PPageTitle,
        PFieldGroup,
        PDictInputGroup,
        PJsonSchemaForm,
        PPaneLayout,
        GeneralPageLayout,
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
        const fixFormTS = new JsonSchemaFormToolSet();

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
            sch.addEnumProperty('schemaName', 'Secret Type', props.schemaNames, true, { default: props.schemaNames[0] });
            return sch;
        };
        watch(() => props.schemaNames, (after, before) => {
            if (after !== before) {
                const sch = makeFixSchema();
                fixFormTS.setProperty(sch, ['name', 'schemaName'], validation);
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
        getSchema(props.schemaNames[0]);

        watch(() => fixFormTS.syncState.item, async (after, before) => {
            if (after.schemaName && after.schemaName !== before.schemaName) {
                await getSchema(after.schemaName);
            }
        });


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
            proxyVisible: makeProxy('visible', props, context.emit),
            tagsTS,
            jscTS,
            fixFormTS,
            confirm,
        };
    },
};
</script>
