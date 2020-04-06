<template>
    <p-button-modal
        header-title="Create Secret"
        :centered="true"
        size="lg"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm"
    >
        <template #body>
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
        </template>
    </p-button-modal>
</template>
<script lang="ts">

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import {
    makeProxy, requiredValidation,
} from '@/lib/compostion-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import { CustomKeywords, JsonSchemaFormToolSet } from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/JsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';
import { validationAutoChange } from '@/components/molecules/tabs/progress-tab-bar/ProgressTabBar.stories';
import fluentApi from '@/lib/fluent-api';
import { watch } from '@vue/composition-api';
import { AxiosResponse } from 'axios';
import Ajv from 'ajv';

export default {
    name: 'SSecretCreateFormModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PDictInputGroup,
        PJsonSchemaForm,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        schemaNames: {
            type: Array,
            default: () => ([]),
        },
        item: {
            type: Object,
            default: () => ({
                properties: {},
            }),
        },
        updateMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const tagsTS = new DictIGToolSet({
            showValidation: true,
        });
        const fixFormTS = new JsonSchemaFormToolSet();
        const validation: CustomKeywords = {
            uniqueName: {
                async: true,
                validate: (...args: any[]) => fluentApi.secret().secret().list()
                    .setFilter({ key: 'name', operator: '=', value: args[1] })
                    .setCountOnly()
                    .execute()
                    .then(resp => (resp.data.total_count === 0?true:false)),
                errors: false,
            },
        };
        const makeFixSchema = () => {
            const sch = new JsonSchemaObjectType(undefined, undefined, true, true);
            sch.addStringProperty('name', 'Name', true, undefined, { uniqueName: true });
            sch.addEnumProperty('schemaName', 'Secret Type', props.schemaNames, true, { default: props.schemaNames[0] });
            return sch;
        };
        makeFixSchema();
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
