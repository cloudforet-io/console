<template>
    <p-button-modal
        :header-title="updateMode ?$t('IDENTITY.UPDATE_PROJ_GRP') :$t('IDENTITY.CRT_PROJ_GRP')"
        :centered="true"
        :scrollable="false"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!isValid"
        @confirm="confirm"
    >
        <template #body>
            <p-field-group label="name"
                           :invalid-text="projectGroupNameInvalidText"
                           :invalid="projectGroupName && !isValid"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="projectGroupName" class="block w-full" :class="{'is-invalid': invalid}"
                                  placeholder="Project Name"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { ProjectGroup } from '@/views/project/project/modules/ProjectSearch.toolset';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { makeProxy } from '@/lib/compostion-util';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';

interface Props {
    visible: boolean;
    updateMode: boolean;
    id?: string;
    parent: ProjectGroup|null;
}
export default {
    name: 'ProjectGroupCreateFormModal',
    components: {
        PTextInput,
        PFieldGroup,
        PButtonModal,
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
    setup(props: Props, { emit, root }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            projectGroupNames: [] as string[],
            projectGroupName: undefined as undefined | string,
            projectGroupNameInvalidText: computed(() => {
                let invalidText = '';
                if (typeof state.projectGroupName === 'string') {
                    if (state.projectGroupName.length === 0) {
                        invalidText = 'Should have required property \'name\'';
                    } else if (state.projectGroupName.length > 40) {
                        invalidText = 'Should not be longer than 40 characters';
                    } else if (state.projectGroupNames.includes(state.projectGroupName)) {
                        invalidText = 'Name is duplicated';
                    }
                }
                return invalidText;
            }),
            isValid: computed(() => {
                if (state.projectGroupName) {
                    return !(state.projectGroupName.length === 0 || state.projectGroupName.length > 40 || state.projectGroupNames.includes(state.projectGroupName));
                }
                return false;
            }),
        });

        const getProjectGroupNames = async () => {
            const query = new QueryHelper().setOnly('name');
            const res = await SpaceConnector.client.identity.projectGroup.list({
                query: query.data,
            });
            state.projectGroupNames = res.results.map(d => d.name);
        };

        const getProjectGroup = async () => {
            const query = new QueryHelper().setOnly('project_group_id', 'name');
            const res = await SpaceConnector.client.identity.projectGroup.get({
                project_group_id: props.id,
                query: query.data,
            });
            state.projectGroupName = res.name;
        };

        const createProjectGroup = async (item) => {
            try {
                const params = item;
                if (props.parent) params.parent_project_group_id = props.parent.id;
                const res = await SpaceConnector.client.identity.projectGroup.create(params);
                showSuccessMessage('Success', 'Create Project Group', root);

                emit('create', {
                    id: res.project_group_id,
                    name: item.name,
                } as ProjectGroup, props);
            } catch (e) {
                showErrorMessage('Fail to Create Project Group', e, root);
            }
        };

        const updateProjectGroup = async (item) => {
            try {
                const params = item;
                if (props.id) params.project_group_id = props.id;
                await SpaceConnector.client.identity.projectGroup.update(params);
                showSuccessMessage('Success', 'Update Project Group', root);

                emit('update', {
                    id: props.id,
                    name: item.name,
                } as ProjectGroup, props);
            } catch (e) {
                showErrorMessage('Fail to Update Project Group', e, root);
            }
        };
        const confirm = async () => {
            if (!state.isValid) return;
            const item = {
                name: state.projectGroupName,
            };
            if (!props.updateMode) {
                await createProjectGroup(item);
            } else {
                await updateProjectGroup(item);
            }
        };

        watch(() => props.id, async (after) => {
            if (after) await getProjectGroup();
            else state.projectGroupName = undefined; // init form
        }, { immediate: true });

        const init = async () => {
            await getProjectGroupNames();
        };
        init();

        return {
            ...toRefs(state),
            confirm,
        };
    },
};
</script>
