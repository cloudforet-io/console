<template>
    <p-button-modal
        :header-title="updateMode ?$t('IDENTITY.UPDATE_PROJ_GRP') :$t('IDENTITY.CRT_PROJ_GRP')"
        :centered="true"
        :scrollable="false"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm"
    >
        <template #body>
            <PJsonSchemaForm v-bind="fixFormTS.state" :item.sync="fixFormTS.syncState.item" />
            <!--            <PFieldGroup-->
            <!--                label="Tags"-->
            <!--            >-->
            <!--                <p-dict-input-group-->
            <!--                    class="w-full bg-primary4 border-gray-200 border-gray-200 p-2"-->
            <!--                    v-bind="tagsTS.state"-->
            <!--                    :items.sync="tagsTS.syncState.items"-->
            <!--                    v-on="tagsTS.events"-->
            <!--                />-->
            <!--            </PFieldGroup>-->
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import {
    makeProxy,
} from '@/lib/compostion-util';
import {
    CustomKeywords,
    JsonSchemaFormToolSet,
    CustomValidator,
} from '@/components/organisms/forms/json-schema-form/toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/JsonSchemaForm.vue';
import { JsonSchemaObjectType } from '@/lib/type';
import { fluentApi } from '@/lib/fluent-api';
import { showErrorMessage } from '@/lib/util';
import { watch } from '@vue/composition-api';
import { ProjectGroup } from '@/views/project/project/modules/ProjectSearch.toolset';

interface Props {
    visible: boolean;
    updateMode: boolean;
    id?: string;
    parent: ProjectGroup|null;
}
export default {
    name: 'ProjectGroupCreateFormModal',
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
        updateMode: {
            type: Boolean,
            default: false,
        },
        parent: {
            type: Object,
            default: null,
        },
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props: Props, context) {
        // const tagsTS = new DictIGToolSet({
        //     showValidation: true,
        // });

        let fixFormTS = new JsonSchemaFormToolSet();

        const checkNameUnique = (...args: any[]) => fluentApi.identity().projectGroup().list()
            .setFilter({ key: 'name', operator: '=', value: args[1] })
            .setCountOnly()
            .execute()
            .then(resp => resp.data.total_count === 0);

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


        const getProjectGroup = async () => {
            const res = await fluentApi.identity().projectGroup().get()
                .setId(props.id as string)
                .setOnly('project_group_id', 'name')
                .execute();
            fixFormTS.syncState.item.project_group_id = res.data.project_group_id;
            fixFormTS.syncState.item.name = res.data.name;
        };

        const resetForm = () => {
            fixFormTS.syncState.item.project_group_id = '';
            fixFormTS.syncState.item.name = '';
        };

        const initForm = async () => {
            fixFormTS = new JsonSchemaFormToolSet();
            const sch = new JsonSchemaObjectType(undefined, undefined, true);
            sch.addStringProperty('name', 'Name', true, undefined, { uniqueName: true, longName: true });
            fixFormTS.setProperty(sch, ['name'], validation);
            if (props.id) await getProjectGroup();
            else {
                resetForm();
            }
        };

        watch(() => props.id, async (id) => {
            await initForm();
        });

        const createProjectGroup = async (item) => {
            try {
                const params = item;
                if (props.parent) params.parent_project_group_id = props.parent.id;
                const res = await fluentApi.identity().projectGroup().create()
                    .setParameter(params)
                    .execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'Create Project Group',
                    duration: 2000,
                    speed: 1000,
                });

                context.emit('create', {
                    id: res.data.project_group_id,
                    name: item.name,
                } as ProjectGroup, props);
            } catch (e) {
                showErrorMessage('Fail to Create Project Group', e, context.root);
            }
        };

        const updateProjectGroup = async (item) => {
            try {
                const params = item;
                if (props.id) params.project_group_id = props.id;
                await fluentApi.identity().projectGroup().update().setParameter(params)
                    .execute();

                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'Update Project Group',
                    duration: 2000,
                    speed: 1000,
                });

                context.emit('update', {
                    id: props.id,
                    name: item.name,
                } as ProjectGroup, props);
            } catch (e) {
                showErrorMessage('Fail to Update Project Group', e, context.root);
            }
        };
        const projectGroupFormConfirm = async (item) => {
            if (!props.updateMode) {
                await createProjectGroup(item);
            } else {
                await updateProjectGroup(item);
            }
        };
        const confirm = async () => {
            const fixFormValid = await fixFormTS.formState.validator();
            if (fixFormValid) {
                const item = {
                    name: fixFormTS.syncState.item.name,
                };
                await projectGroupFormConfirm(item);
            }
        };

        return {
            proxyVisible: makeProxy('visible', props, context.emit),
            fixFormTS,
            confirm,
        };
    },
};
</script>
