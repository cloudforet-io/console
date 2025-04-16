<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PDataTable, PLink, PBadge,
} from '@cloudforet/mirinae';



import type { Tags } from '@/api-clients/_common/schema/model';
import type { UserGetParameters } from '@/api-clients/identity/user/schema/api-verbs/get';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceItem } from '@/store/reference/project-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UserRoleItem {
    labels?: string[]|string;
    project_group_info?: ProjectGroupReferenceItem|string;
    project_info: ProjectReferenceItem|string;
    resource_id: string;
    resource_type: string;
    role_binding_id: string;
    role_info: any;
    tags?: Tags;
}
interface Props {
    userId: string
}

const props = withDefaults(defineProps<Props>(), {
    userId: '',
});

const router = useRouter();

const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();

const { getReferenceLocation } = useReferenceRouter();

const state = reactive({
    title: computed(() => i18n.t('IAM.USER.MAIN.ASSIGNED_ROLES')),
    loading: true,
    fields: computed(() => [
        { name: 'role_info.name', label: 'Role Name' },
        { name: 'role_info.role_type', label: 'Role Type' },
        { name: 'project_group_info.project_group_id', label: 'Project Group' },
        { name: 'project_info.project_id', label: 'Project' },
        { name: 'labels', label: 'Labels' },
    ]),
    items: [] as UserRoleItem[],
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    projects: computed(() => allReferenceStore.getters.project),
});

const getProjectLink = (value, isProject: boolean) => {
    if (isProject) {
        const link = router.resolve(getReferenceLocation(value, {
            resource_type: 'identity.Project',
        }));
        return {
            ...link.resolved,
            workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
        };
    }
    const link = router.resolve(getReferenceLocation(value, {
        resource_type: 'identity.ProjectGroup',
    }));
    return {
        ...link.resolved,
        workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
    };
};

const getUserDetailData = async (userId) => {
    state.loading = true;
    try {
        const res = await SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>({
            user_id: userId,
        });

        state.items = res.role_bindings.map((d) => ({
            ...d,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};

watch(() => props.userId, () => {
    const userId = props.userId;
    getUserDetailData(userId);
}, { immediate: true });
</script>

<template>
    <div>
        <p-heading class="mt-8 mx-4 mb-6"
                   heading-type="sub"
                   :title="state.title"
        />
        <p-data-table
            :items="state.items"
            :loading="state.loading"
            :fields="state.fields"
            :striped="false"
        >
            <template #col-project_group_info.project_group_id-format="{value}">
                <p-link v-if="value"
                        action-icon="internal-link"
                        new-tab
                        :to="getProjectLink(value, false)"
                >
                    {{ state.projectGroups[value] ? state.projectGroups[value].label : value }}
                </p-link>
                <p v-if="!value">
                    -
                </p>
            </template>
            <template #col-project_info.project_id-format="{value}">
                <p-link v-if="value"
                        action-icon="internal-link"
                        new-tab
                        :to="getProjectLink(value, true)"
                >
                    {{ state.projects[value] ? state.projects[value].label : value }}
                </p-link>
                <p v-if="!value">
                    -
                </p>
            </template>
            <template #col-labels-format="{value}">
                <p v-if="value.length === 0" />
                <p-badge v-for="(label, idx) in value"
                         :key="idx"
                         badge-type="subtle"
                         style-type="gray200"
                         class="mr-2"
                >
                    {{ label }}
                </p-badge>
            </template>
        </p-data-table>
    </div>
</template>
