<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PDataTable, PAnchor, PBadge,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { Tags } from '@/models';

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
    userId: string;
}

const props = defineProps<Props>();

const store = useStore();
const { t } = useI18n();
const router = useRouter();

const baseState = reactive({
    title: computed(() => t('IDENTITY.USER.MAIN.ASSIGNED_ROLES')),
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
    baseState.loading = true;
    try {
        const res = await SpaceConnector.client.identity.user.get({
            user_id: userId,
            // eslint-disable-next-line camelcase
            include_role_binding: true,
        });

        baseState.items = res.role_bindings.map((d) => ({
            ...d,
        }));
        baseState.loading = false;
    } catch (e) {
        ErrorHandler.handleError(e);
        baseState.items = [];
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
                   :title="baseState.title"
        />
        <p-data-table
            :items="baseState.items"
            :loading="baseState.loading"
            :fields="baseState.fields"
            :striped="false"
        >
            <template #col-project_group_info.project_group_id-format="{value}">
                <p-anchor v-if="value"
                          :href="getProjectLink(value, false)"
                >
                    {{ projectGroups[value] ? projectGroups[value].label : value }}
                </p-anchor>
                <p v-if="!value">
                    -
                </p>
            </template>
            <template #col-project_info.project_id-format="{value}">
                <p-anchor v-if="value"
                          :href="getProjectLink(value, true)"
                >
                    {{ projects[value] ? projects[value].label : value }}
                </p-anchor>
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
