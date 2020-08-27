<template>
    <p-button-modal
        :header-title="updateMode ?$t('IDENTITY.UPDATE_PROJ') :$t('IDENTITY.CRT_PROJ')"
        :centered="true"
        size="md"
        :fade="true"
        :scrollable="false"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm"
    >
        <template #body>
            <p-json-schema-form v-bind="fixFormTS.state" :item.sync="fixFormTS.syncState.item" />
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import {
    makeProxy,
} from '@/lib/compostion-util';
import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/PDictInputGroup.toolset';
import {
    CustomKeywords,
    JsonSchemaFormToolSet,
    CustomValidator,
} from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';
import { fluentApi } from '@/lib/fluent-api';

export default {
    name: 'ProjectCreateFormModal',
    components: {
        PButtonModal,
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
        projectGroupId: {
            type: String,
            default: '',
        },
        currentProject: {
            type: String,
            default: '',
        },
    },
    setup(props, context) {
        const tagsTS = new DictIGToolSet({
            showValidation: true,
        });
        const fixFormTS = new JsonSchemaFormToolSet();

        const checkNameUnique = (...args: any[]) => fluentApi.identity().projectGroup().listProjects()
            .setProjectGroupId(props.projectGroupId)
            .setFilter({ key: 'name', operator: '=', value: args[1] })
            .setCountOnly()
            .execute()
            .then(rp => rp.data.total_count === 0);

        const checkNameLength = (...args) => {
            const prom = new Promise<boolean>((resolve, reject) => {
                const data = args[1] || '';
                if (data.length <= 40) {
                    resolve(true);
                }
                resolve(false);
            });
            return prom;
        };

        const validation: CustomKeywords = {
            uniqueName: new CustomValidator(checkNameUnique, 'The name already exists.'),
            longName: new CustomValidator(checkNameLength, 'Should not be longer than 40 characters'),
        };

        const sch = new JsonSchemaObjectType(undefined, undefined, true);
        if (props.updateMode) {
            sch.addStringProperty('name', 'Name', true, props.currentProject, { uniqueName: true, longName: true });
        } else {
            sch.addStringProperty('name', 'Name', true, undefined, { uniqueName: true, longName: true });
        }
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
