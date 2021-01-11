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
                <p-anchor v-if="value" :href="getProjectLink(value)" target="_blank">
                    {{ projects[value] ? projects[value].label : value }}
                </p-anchor>
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
                { name: 'label', label: 'Labels' },
            ]),
            items: [] as any,
            projects: computed(() => vm.$store.state.resource.project.items),
        });

        const getProjectLink = (value) => {
            const link = vm.$router.resolve(referenceRouter(
                value, {
                    resource_type: 'identity.Project',
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
