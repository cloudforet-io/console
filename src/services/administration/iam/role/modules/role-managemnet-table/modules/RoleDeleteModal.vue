<template>
    <delete-modal :visible.sync="proxyVisible"
                  size="lg"
                  :header-title="headerTitle"
                  :hide-footer="!isDeletable"
                  :loading="loading"
                  :enable-scroll="true"
                  @confirm="handleDelete"
    >
        <template #delete-modal-body>
            <div v-if="!isDeletable"
                 class="mb-4"
            >
                {{ $t('IAM.ROLE.MODAL.DELETE_HELP_TEXT') }}
            </div>
            <p-data-table v-if="isDeletable"
                          class="role-data-table"
                          :items="roles"
                          :fields="fields"
                          :loading="loading"
                          :table-custom-style="{ maxHeight: 'calc(100vh - 17.5rem)' }"
            >
                <template #col-role_type-format="{ value }">
                    <p-badge v-if="value"
                             badge-type="solid-outline"
                             :style-type="ROLE_TYPE_BADGE_OPTION[value].styleType"
                    >
                        {{ ROLE_TYPE_BADGE_OPTION[value] ? ROLE_TYPE_BADGE_OPTION[value].label : '' }}
                    </p-badge>
                </template>
                <template #col-tags.description-format="{ value }">
                    {{ value ? value : '--' }}
                </template>
            </p-data-table>
            <p-data-table v-else
                          :items="unDeletableRoles"
                          :fields="unDeletableRoleFields"
                          :loading="loading"
                          :table-custom-style="{ maxHeight: 'calc(100vh - 19.5rem)' }"
            >
                <template #col-roleDescription-format="{ value }">
                    {{ value ? value : '--' }}
                </template>
                <template #col-roleType-format="{ value }">
                    <p-badge v-if="value"
                             badge-type="solid-outline"
                             :style-type="ROLE_TYPE_BADGE_OPTION[value].styleType"
                    >
                        {{ ROLE_TYPE_BADGE_OPTION[value] ? ROLE_TYPE_BADGE_OPTION[value].label : '' }}
                    </p-badge>
                </template>
                <template #col-assignTo-format="{ value }">
                    {{ users[value.resource_id] ? users[value.resource_id].label : '--' }}
                </template>
                <template #col-project-format="{ value }">
                    <p-anchor v-if="value"
                              :highlight="true"
                              :href="getProjectLink(value)"
                    >
                        {{ projectFieldHandler(value, projects) }}
                    </p-anchor>
                </template>
            </p-data-table>
        </template>
    </delete-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { PropType } from 'vue';

import { PDataTable, PBadge, PAnchor } from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import type { RoleBindingType } from '@/services/administration/iam/role/modules/role-managemnet-table/modules/type';
import type { RoleData } from '@/services/administration/iam/role/type';
import type { ProjectGroupInfo, ProjectModel } from '@/services/project/type';

interface UnDeletableRole {
    roleName: string;
    roleDescription: string;
    roleType: string;
    assignTo: { resource_id: string; resource_type: string };
    project?: {
        project_info: ProjectModel | undefined;
        project_group_info: ProjectGroupInfo | undefined;
    };
}

export default {
    name: 'RoleDeleteModal',
    components: {
        DeleteModal,
        PDataTable,
        PBadge,
        PAnchor,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        roles: {
            type: Array as PropType<RoleData[]>,
            default: () => [],
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
            projects: computed(() => store.getters['reference/projectItems']),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
            loading: true,
            proxyVisible: useProxyValue('visible', props, emit),
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'tags.description', label: 'Description' },
                { name: 'role_type', label: 'Role Type' },
                { name: 'created_at', label: 'Created' },
            ] as DataTableField[],
            unDeletableRoles: [] as UnDeletableRole[],
            unDeletableRoleFields: [
                { name: 'roleName', label: 'Role Name' },
                { name: 'roleDescription', label: 'Role Description' },
                { name: 'roleType', label: 'Role Type' },
                { name: 'assignTo', label: 'Assigned To' },
                { name: 'project', label: ' ' },
            ] as DataTableField[],
            isDeletable: computed(() => state.unDeletableRoles.length === 0),
            headerTitle: computed(() => (state.isDeletable ? i18n.t('IAM.ROLE.MODAL.DELETE_TITLE') : i18n.t('IAM.ROLE.MODAL.DELETE_TITLE_CANNOT'))),
        });

        const handleDelete = async () => {
            let isAllSucceed = true;
            await Promise.all(props.roles.map(async (role) => {
                try {
                    await SpaceConnector.client.identity.role.delete({
                        role_id: role.role_id,
                    });
                } catch (e) {
                    ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.ALT_E_DELETE_ROLE'));
                    isAllSucceed = false;
                }
            }));
            if (isAllSucceed) {
                showSuccessMessage(i18n.t('IAM.ROLE.ALT_S_DELETE_ROLE'), '');
                state.proxyVisible = false;
                emit('refresh');
            }
        };

        const projectFieldHandler = (value, projects) => {
            if (value) {
                const projectId = value.project_info?.project_id;
                if (projectId) {
                    return projects[projectId] ? projects[projectId].label : projectId;
                }
                const projectGroupId = value.project_group_info?.project_group_id;
                return state.projectGroups[projectGroupId] ? state.projectGroups[projectGroupId].label : projectGroupId;
            }
            return '--';
        };

        const getProjectLink = (value) => {
            const projectId = value?.project_info?.project_id;
            let link;
            if (projectId) {
                link = SpaceRouter.router.resolve(referenceRouter(projectId, {
                    resource_type: 'identity.Project',
                }));
            } else {
                const projectGroupId = value?.project_group_info?.project_group_id;
                link = SpaceRouter.router.resolve(referenceRouter(projectGroupId, {
                    resource_type: 'identity.ProjectGroup',
                }));
            }
            return link.href;
        };
        const getRoleBindingList = () => Promise.all(props.roles.map(async (role) => {
            try {
                const { results }: Record<'results', RoleBindingType[]> = await SpaceConnector.client.identity.roleBinding.list({ role_id: role.role_id });
                const roleBindingList: UnDeletableRole[] = results.map((roleBinding) => {
                    const {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        resource_id, resource_type, role_info, project_info, project_group_info,
                    } = roleBinding;
                    return {
                        roleName: role_info?.name,
                        roleDescription: role_info?.tags?.description,
                        roleType: role_info?.role_type,
                        assignTo: { resource_id, resource_type },
                        project: (project_info || project_group_info) ? { project_info, project_group_info } : undefined,
                    };
                });
                state.unDeletableRoles = state.unDeletableRoles.concat(roleBindingList);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.unDeletableRoles = [];
            }
        }));

        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/user/load'),
            ]);
        })();

        /* Watcher */
        watch(() => state.proxyVisible, async (after) => {
            state.loading = true;
            if (after) {
                state.unDeletableRoles = [];
                await getRoleBindingList();
                state.loading = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleDelete,
            projectFieldHandler,
            getProjectLink,
            ROLE_TYPE_BADGE_OPTION,
        };
    },
};
</script>
