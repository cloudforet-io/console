<template>
    <p-tree class="escalation-policy-project-tree"
            :edit-options="{disabled: true}"
            :drag-options="{disabled: true}"
            :toggle-options="toggleOptions"
            :select-options="selectOptions"
            :data-setter="dataSetter"
            :data-getter="dataGetter"
            :data-fetcher="dataFetcher"
            fetch-on-init
            @init="onTreeInit"
            @change-select="onChangeSelect"
    >
        <template #data="{node}">
            <span class="ml-1">{{ node.data.name }}</span>
        </template>
        <template #toggle="{node, selected, path}">
            <p-radio v-if="node.data.item_type === 'PROJECT'"
                     :selected="selected"
                     :value="true"
                     @click.stop="changeSelectState(node, path)"
            />
        </template>
        <template #toggle-right="{node}">
            <p-i v-if="node.data.item_type === 'PROJECT_GROUP'"
                 name="ic_folder-filled"
                 class="project-group-icon"
                 width="1rem"
                 height="1rem"
                 color="inherit transparent"
            />
        </template>
    </p-tree>
</template>

<script lang="ts">

import { computed, reactive, toRefs } from 'vue';

import {
    PTree, PI, PRadio,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ProjectGroup } from '@/services/asset-inventory/service-account/type';
import type { ProjectGroupTreeItem, ProjectTreeRoot } from '@/services/project/type';

export default {
    name: 'EscalationPolicyProjectTree',
    components: {
        PTree,
        PI,
        PRadio,
    },
    props: {
        selectedProjectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            root: null as ProjectTreeRoot|null,
            selectedItem: {} as ProjectGroupTreeItem,
            selectedNode: computed(() => state.selectedItem.node),
        });

        const toggleOptions = {
            validator: (node) => node.data.has_child || node.children.length > 0,
            removeChildrenOnFold: true,
        };
        const selectOptions = {
            validator({ data }) {
                return data.item_type === 'PROJECT';
            },
        };
        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = (node) => node.data.name;
        const dataFetcher = async (node): Promise<ProjectGroup[]> => {
            try {
                const params: any = {
                    sort: { key: 'name', desc: false },
                    item_type: 'ROOT',
                    check_child: true,
                };

                if (node.data?.id && node.data?.item_type) {
                    params.item_id = node.data.id;
                    params.item_type = node.data.item_type;
                }

                const { items } = await SpaceConnector.client.identity.project.tree(params);
                return items;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };
        const onTreeInit = async (root) => {
            state.root = root;
        };
        const onChangeSelect = (selected) => {
            state.selectedItem = selected.length > 0 ? selected[0] : {};
            emit('update:selected-project-id', selected.length > 0 ? selected[0].node.data.id : undefined);
        };
        const changeSelectState = (node, path) => {
            state.root.changeSelectState(node, path);
        };

        return {
            ...toRefs(state),
            toggleOptions,
            selectOptions,
            dataSetter,
            dataGetter,
            dataFetcher,
            onTreeInit,
            onChangeSelect,
            changeSelectState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.escalation-policy-project-tree {
    @apply border border-gray-200 bg-gray-100 rounded-md;
    max-height: 15rem;
    overflow-y: auto;
    margin-top: 0.5rem;
}
</style>
