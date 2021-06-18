<template>
    <p-select-dropdown class="project-select-dropdown"
                       :loading="loading"
                       always-show-menu
                       use-fixed-menu-style
                       :invalid="invalid"
    >
        <div class="tag-wrapper">
            <p-tag v-for="({node, path}) in selectedItems" :key="node.data.id"
                   activated
                   @delete="onDeleteTag(node, path)"
            >
                {{ node.data.name }}
            </p-tag>
        </div>
        <template #menu-menu>
            <p-tree :edit-options="{disabled: true}"
                    :drag-options="{disabled: true}"
                    :toggle-options="toggleOptions"
                    :select-options="selectOptions"
                    :data-setter="dataSetter"
                    :data-getter="dataGetter"
                    :data-fetcher="dataFetcher"
                    @init="onTreeInit"
                    @change-select="onChangeSelect"
            >
                <template #data="{node}">
                    <span class="ml-1">{{ node.data.name }}</span>
                </template>
                <template #toggle-right="{node, path}">
                    <p-i v-if="node.data.item_type === 'PROJECT_GROUP'" name="ic_tree_project-group" class="project-group-icon"
                         width="1rem" height="1rem" color="inherit transparent"
                    />
                    <component :is="selectComponent"
                               v-else
                               :selected="selectedProjects" :value="node.data"
                               :predicate="predicate"
                               @change="changeSelectState(node, path, ...arguments)"
                    />
                </template>
            </p-tree>
        </template>
    </p-select-dropdown>
</template>

<script lang="ts">
import {
    PCheckBox, PI, PRadio, PSelectDropdown, PTag, PTree,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { ProjectGroup } from '@/views/identity/service-account/type';
import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'ProjectSelectDropdown',
    components: {
        PSelectDropdown,
        PTag,
        PTree,
        PRadio,
        PCheckBox,
        PI,
    },
    props: {
        multiSelectable: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            root: null as any,
            selectedItems: [] as any[],
            selectedProjects: computed<string[]>(() => state.selectedItems.map(d => d.node.data)),
            selectComponent: computed(() => {
                if (props.multiSelectable) return PCheckBox;
                return PRadio;
            }),
            loading: true,
            selectOptions: computed(() => ({
                multiSelectable: props.multiSelectable,
                validator({ data }) {
                    return data.item_type === 'PROJECT';
                },
            })),
        });

        const predicate = (current, data) => current?.id === data.id;

        const toggleOptions = {
            validator: node => node.data.item_type === 'PROJECT_GROUP' && (node.data.has_child || node.children.length > 0),
            toggleOnNodeClick: true,
        };
        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = node => node.data.name;
        const dataFetcher = async (node): Promise<ProjectGroup[]> => {
            if (!node) state.loading = true;
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
                console.error(e);
                return [];
            } finally {
                if (state.loading) state.loading = false;
            }
        };
        const onTreeInit = async (root) => {
            state.root = root;
        };

        const onChangeSelect = (selected) => {
            state.selectedItems = selected;
            emit('select', state.selectedProjects);
        };

        const changeSelectState = (node, path, selected, value) => {
            if (state.root) state.root.changeSelectState(node, path, value);
        };

        const onDeleteTag = (node, path) => {
            if (state.root) state.root.changeSelectState(node, path, false);
        };


        return {
            ...toRefs(state),
            predicate,
            toggleOptions,
            dataSetter,
            dataGetter,
            dataFetcher,
            onTreeInit,
            onChangeSelect,
            changeSelectState,
            onDeleteTag,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-select-dropdown {
    display: block;
    width: 100%;
    .tag-wrapper {
        display: flex;
        flex-wrap: wrap;
    }
    &.p-select-dropdown::v-deep {
        .dropdown-button {
            width: 100%;
        }
    }
    .p-tree::v-deep {
        padding: 0.25rem;
        .tree-node .node.selected {

        }
    }
}
</style>
