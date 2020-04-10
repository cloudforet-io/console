<template>
    <p-button-modal
        header-title="Create Project"
        :centered="true"
        size="lg"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm"
    >
        <template #body>
            <PJsonSchemaForm v-bind="fixFormTS.state" :item.sync="fixFormTS.syncState.item" />
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
import {
    CustomKeywords,
    JsonSchemaFormToolSet,
    makeCustomError,
    CustomValidator,
} from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/JsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';
import { fluentApi } from '@/lib/fluent-api';
import { watch } from '@vue/composition-api';
import { AxiosResponse } from 'axios';

export default {
    name: 'ProjectCreateFormModal',
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

        const checkNameUnique = (...args: any[]) => fluentApi.identity().project().list()
            .setFilter({ key: 'name', operator: '=', value: args[1] })
            .setCountOnly()
            .execute()
            .then(resp => resp.data.total_count === 0);

        const validation: CustomKeywords = {
            uniqueName: new CustomValidator(checkNameUnique, 'name is duplicated'),
        };

        const sch = new JsonSchemaObjectType(undefined, undefined, true);
        sch.addStringProperty('name', 'Name', true, undefined, { uniqueName: true });
        fixFormTS.setProperty(sch, ['name'], validation);
        const confirm = async () => {
            const fixFormValid = await fixFormTS.formState.validator();
            if (tagsTS.allValidation() && fixFormValid) {
                const item = {
                    name: fixFormTS.syncState.item.name,
                    tags: tagsTS.vdState.newDict,
                };
                context.emit('confirm', item);
            }
        };

        return {
            proxyVisible: makeProxy('visible', props, context.emit),
            tagsTS,
            fixFormTS,
            confirm,
        };
    },
};
</script>

<style scoped>

</style>
