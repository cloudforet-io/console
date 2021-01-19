<template>
    <div>
        <p-panel-top>{{ title }}</p-panel-top>
        <p-data-table
            :items="items"
            :loading="loading"
            :fields="fields"
            :striped="false"
        >
            <template #col-project_info.project_id-format="{value}">
                <p-anchor v-if="value" :href="getProjectLink(value, false)" target="_blank">
                    {{ projectGroups[value] ? projectGroups[value].label : value }}
                </p-anchor>
                <p v-if="!value">
                    -
                </p>
            </template>
            <template #col-project_group_info.project_group_id-format="{value}">
                <p-anchor v-if="value" :href="getProjectLink(value, true)" target="_blank">
                    {{ projects[value] ? projects[value].label : value }}
                </p-anchor>
                <p v-if="!value">
                    -
                </p>
            </template>
            <template #col-labels-format="{value}">
                <p v-if="value.length === 0">
                    -
                </p>
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PPanelTop, PDataTable, PAnchor } from '@spaceone/design-system';

import { timestampFormatter } from '@/lib/util';
import { userStateFormatter } from '@/views/identity/user/lib/helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { SpaceConnector } from '@/lib/space-connector';
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

        const getUserDetailData = async (userId) => {
            baseState.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.get({
                    user_id: userId,
                    // eslint-disable-next-line camelcase
                    include_role_binding: true,
                });

                baseState.items = res.role_bindings;

                // res.role_bindings.map(d => ({
                //     labels: d.labels.length > 0 ? d.labels : '-',
                //     // eslint-disable-next-line camelcase
                //     project_group_info_id: d.project_group_info.project_group_id ? d.project_group_info.project_group_id : '-',
                //     // eslint-disable-next-line camelcase
                //     project_info: d.project_info ? d.project_info : '-',
                //     resource_id: d.resource_id,
                //     resource_type: d.resorce_type,
                //     role_binding_id: d.role_binding_id,
                //     // eslint-disable-next-line camelcase
                //     role_info: d.role_info,
                //     tags: d.tags,
                // }));
                console.log(baseState.items);
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
            timestampFormatter,
            referenceRouter,
            getProjectLink,
        };
    },
};
</script>
