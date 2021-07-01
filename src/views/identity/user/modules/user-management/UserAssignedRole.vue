<template>
    <div>
        <p-panel-top>{{ title }}</p-panel-top>
        <p-data-table
            :items="items"
            :loading="loading"
            :fields="fields"
            :striped="false"
        >
            <template #col-project_group_info.project_group_id-format="{value}">
                <p-anchor v-if="value" :href="getProjectLink(value, false)" target="_blank">
                    {{ projectGroups[value] ? projectGroups[value].label : value }}
                </p-anchor>
                <p v-if="!value">
                    -
                </p>
            </template>
            <template #col-project_info.project_id-format="{value}">
                <p-anchor v-if="value" :href="getProjectLink(value, true)" target="_blank">
                    {{ projects[value] ? projects[value].label : value }}
                </p-anchor>
                <p v-if="!value">
                    -
                </p>
            </template>
            <template #col-labels-format="{value}">
                <p v-if="value.length === 0" />
                <p-badge v-for="(label, idx) in value" :key="idx" style-type="gray200"
                         class="mr-2"
                >
                    {{ label }}
                </p-badge>
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PPanelTop, PDataTable, PAnchor, PBadge,
} from '@spaceone/design-system';

import { userStateFormatter } from '@/views/identity/user/lib/helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { SpaceConnector } from '@/core-lib/space-connector';
import { Tags } from '@/models';

interface UserRoleItem {
    labels?: string[]|string;
    project_group_info?: object|string;
    project_info: object|string;
    resource_id: string;
    resource_type: string;
    role_binding_id: string;
    role_info: object;
    tags?: Tags;
}

export default {
    name: 'UserAssignedRole',
    components: {
        PDataTable,
        PPanelTop,
        PAnchor,
        PBadge,
    },
    props: {
        userId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const baseState = reactive({
            title: 'Assigned Roles',
            loading: true,
            fields: computed(() => [
                { name: 'role_info.name', label: 'Role Name' },
                { name: 'role_info.role_type', label: 'Role Type' },
                { name: 'project_group_info.project_group_id', label: 'Project Group' },
                { name: 'project_info.project_id', label: 'Project' },
                { name: 'labels', label: 'Labels' },
            ]),
            items: [] as UserRoleItem[],
            projectGroups: computed(() => vm.$store.state.resource.projectGroup.items),
            projects: computed(() => vm.$store.state.resource.project.items),
        });

        const getProjectLink = (value, isProject: true) => {
            if (isProject) {
                const link = vm.$router.resolve(referenceRouter(
                    value, {
                        resource_type: 'identity.Project',
                    },
                ));
                return link.href;
            }
            const link = vm.$router.resolve(referenceRouter(
                value, {
                    resource_type: 'identity.ProjectGroup',
                },
            ));
            return link.href;
        };

        const getArrayWithNotDuplicatedItem = array => [...new Set(array)];

        const getUserDetailData = async (userId) => {
            baseState.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.get({
                    user_id: userId,
                    // eslint-disable-next-line camelcase
                    include_role_binding: true,
                });

                baseState.items = res.role_bindings.map(d => ({
                    ...d,
                }));
                baseState.loading = false;
            } catch (e) {
                baseState.items = [];
                console.error(e);
            }
        };

        watch(() => props.userId, () => {
            const userId = props.userId;
            getUserDetailData(userId);
        }, { immediate: true });

        return {
            ...toRefs(baseState),
            userStateFormatter,
            referenceRouter,
            getProjectLink,
        };
    },
};
</script>
