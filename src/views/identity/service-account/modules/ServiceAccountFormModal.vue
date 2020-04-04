<template>
    <p-button-modal
        header-title="Create Service Account"
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
    makeProxy,
} from '@/lib/compostion-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import { JsonSchemaFormToolSet } from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/JsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';

export default {
    name: 'SServiceAccountFormModal',
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
        schema: {
            type: Object,
            default: undefined,
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
        const schema = new JsonSchemaObjectType();
        schema.addStringProperty('name', 'Name', true);

        fixFormTS.setProperty(schema, ['name']);

        const jscTS = new JsonSchemaFormToolSet();
        jscTS.setProperty(props.schema);


        const confirm = async () => {
            const fixFormValid = fixFormTS.formState.validator();
            const jscFormValid = jscTS.formState.validator();
            if (tagsTS.allValidation() && fixFormValid && jscFormValid) {
                const item = {
                    ...fixFormTS.syncState.item,
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
