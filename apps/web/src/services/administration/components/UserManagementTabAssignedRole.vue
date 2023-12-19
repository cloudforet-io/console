<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHeading, PDataTable, PLink, PBadge,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { Tags } from '@/schema/_common/model';
import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import type { UserModel } from '@/schema/identity/user/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceItem } from '@/store/modules/reference/project/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

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
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    projects: computed(() => store.getters['reference/projectItems']),
});

const getProjectLink = (value, isProject: true) => {
    if (isProject) {
        const link = router.resolve(referenceRouter(value, {
            resource_type: 'identity.Project',
        }));
        return link.href;
    }
    const link = router.resolve(referenceRouter(value, {
        resource_type: 'identity.ProjectGroup',
    }));
    return link.href;
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

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
    ]);
})();
</script>

<template>
    <div>
        <p-heading heading-type="sub"
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
                        :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        :href="getProjectLink(value, false)"
                >
                    {{ state.projectGroups[value] ? state.projectGroups[value].label : value }}
                </p-link>
                <p v-if="!value">
                    -
                </p>
            </template>
            <template #col-project_info.project_id-format="{value}">
                <p-link v-if="value"
                        :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        :href="getProjectLink(value, true)"
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
