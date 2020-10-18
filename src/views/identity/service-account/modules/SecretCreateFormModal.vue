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
            <p-json-schema-form v-bind="fixFormTS.state" :item.sync="fixFormTS.syncState.item" />
            <p-json-schema-form v-bind="jscTS.state" :item.sync="jscTS.syncState.item" />
            <p-field-group
                label="Tags"
            >
                <p-dict-input-group ref="dictRef"
                                    class="w-full bg-primary4 border-gray-200 border-gray-200 p-2"
                                    :dict="tags"
                                    show-validation
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>
<script lang="ts">

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import {
    makeProxy,
} from '@/lib/compostion-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import {
    CustomKeywords,
    JsonSchemaFormToolSet,
    CustomValidator,
} from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';
import {reactive, toRefs, watch} from '@vue/composition-api';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';

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
        const state = reactive({
            tags: {},
            dictRef: null as any,
        });
        const fixFormTS = new JsonSchemaFormToolSet();

        const checkNameUnique = async (...args: any[]) => {
            const query = new QueryHelper()
                .setFilter({ k: 'name', v: args[1], o: 'eq' })
                .setCountOnly();
            return SpaceConnector.client.secret.secret.list({
                query: query.data,
            }).then(res => res.total_count === 0);
        };

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
        }, { immediate: true });


        const jscTS = new JsonSchemaFormToolSet();
        const getSchema = async (name) => {
            if (name) {
                const resp = await SpaceConnector.client.repository.schema.getByName({
                    // eslint-disable-next-line camelcase
                    schema_id: name,
                });
                jscTS.setProperty(resp.schema);
            }
        };
        getSchema(props.schemaNames[0]);

        watch(() => fixFormTS.syncState.item, async (after, before) => {
            if (after.schemaName && after.schemaName !== before?.schemaName) {
                await getSchema(after.schemaName);
            }
        }, { immediate: true });


        const confirm = async () => {
            const fixFormValid = await fixFormTS.formState.validator();
            const jscFormValid = await jscTS.formState.validator();
            if (state.dictRef.allValidation() && fixFormValid && jscFormValid) {
                const item = {
                    name: fixFormTS.syncState.item.name,
                    data: jscTS.syncState.item,
                    schema: fixFormTS.syncState.item.schemaName,
                    tags: state.dictRef.getDict(),

                };
                context.emit('confirm', item);
            }
        };

        return {
            ...toRefs(state),
            proxyVisible: makeProxy('visible', props, context.emit),
            jscTS,
            fixFormTS,
            confirm,
        };
    },
};
</script>
