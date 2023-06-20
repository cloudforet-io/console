<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataTable, PBadge, PAnchor } from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import { useRolePageStore } from '@/services/administration/store/role-page-store';
import type { RoleBindingType } from '@/services/administration/type';
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

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits(['update:visible', 'refresh']);
const store = useStore();
const router = useRouter();
const { t } = useI18n();

const rolePageStore = useRolePageStore();

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
    headerTitle: computed(() => (state.isDeletable ? t('IAM.ROLE.MODAL.DELETE_TITLE') : t('IAM.ROLE.MODAL.DELETE_TITLE_CANNOT'))),
});

const handleDelete = async () => {
    let isAllSucceed = true;
    await Promise.all(rolePageStore.selectedRoles.map(async (role) => {
        try {
            await SpaceConnector.client.identity.role.delete({
                role_id: role.role_id,
            });
        } catch (e) {
            ErrorHandler.handleRequestError(e, t('IAM.ROLE.ALT_E_DELETE_ROLE'));
            isAllSucceed = false;
        }
    }));
    if (isAllSucceed) {
        showSuccessMessage(t('IAM.ROLE.ALT_S_DELETE_ROLE'), '');
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
        link = router.resolve(referenceRouter(projectId, {
            resource_type: 'identity.Project',
        }));
    } else {
        const projectGroupId = value?.project_group_info?.project_group_id;
        link = router.resolve(referenceRouter(projectGroupId, {
            resource_type: 'identity.ProjectGroup',
        }));
    }
    return link.href;
};
const getRoleBindingList = () => Promise.all(rolePageStore.selectedRoles.map(async (role) => {
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

</script>

<template>
    <delete-modal v-model:visible="proxyVisible"
                  size="lg"
                  :header-title="state.headerTitle"
                  :hide-footer="!state.isDeletable"
                  :loading="state.loading"
                  :enable-scroll="true"
                  @confirm="handleDelete"
    >
        <template #delete-modal-body>
            <div v-if="!state.isDeletable"
                 class="mb-4"
            >
                {{ t('IAM.ROLE.MODAL.DELETE_HELP_TEXT') }}
            </div>
            <p-data-table v-if="state.isDeletable"
                          class="role-data-table"
                          :items="rolePageStore.selectedRoles"
                          :fields="state.fields"
                          :loading="state.loading"
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
                          :items="state.unDeletableRoles"
                          :fields="state.unDeletableRoleFields"
                          :loading="state.loading"
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
                        {{ projectFieldHandler(value, state.projects) }}
                    </p-anchor>
                </template>
            </p-data-table>
        </template>
    </delete-modal>
</template>
