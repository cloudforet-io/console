<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{height}">
            <div class="treeSidebar" @click.right.stop.prevent="treeClickedRight">
                <p-tree
                    ref="treeRef"
                    v-bind="treeApiHandler.ts.state"
                    :select-mode="true"
                    @node:selected="selected"
                >
                    <template #icon="{node,isExpanded}">
                        <p-i :name="node.data.item_type === 'PROJECT' ? 'ic_tree_project' :
                                 isExpanded ? 'ic_tree_folder--opened' : 'ic_tree_folder'"
                             color="transparent inherit"
                             width="1rem" height="1rem"
                        />
                    </template>
                </p-tree>
            </div>
        </template>
        <template #default>
            <div v-if="treeApiHandler.ts.metaState.firstSelectedNode" class="flex flex-wrap overflow-hidden right-container">
                <p-grid-layout
                    card-min-width="300px"
                    card-height="15rem"
                    :items="cardItems"
                >
                    <template #card="{item}">
                        <div>
                            {{ item.projectGroupName }}<br>
                            {{ item.projectName }}<br><br><br>

                            <img v-for="(url, index) in item.providers" :key="index" :src="url"
                                 style="width:32px; height:32px; display: inline"
                            >
                            <span v-if="item.extraProviders"> + {{ item.extraProviders }}</span>
                        </div>
                        <br>
                        <br>
                        <hr class="solid">
                        <div v-if="item.summary">
                            Cloud Service   {{ item.summary.cloudService }}<br>
                            Server   {{ item.summary.server }}<br>
                            Member   {{ item.summary.members }}
                        </div>
                        <div v-else>
                            loading
                        </div>
                    </template>
                </p-grid-layout>
            </div>
            <p-empty v-else class="empty">
                <p-i :width="'14rem'" :height="'14rem'" :name="'ic_no_selected_proj'" />
                <div class="empty-msg">
                    No Selected Project<br>
                    Please, Click an item from left table.
                </div>
            </p-empty>
        </template>
    </p-vertical-page-layout2>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, defineComponent, getCurrentInstance, reactive, ref, toRefs,
} from '@vue/composition-api';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import { ProjectTreeFluentAPI } from '@/lib/api/tree';
import TreeItem, { TreeItemInterface, TreeState, TreeToolSet } from '@/components/molecules/tree-new/ToolSet';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import _ from 'lodash';

import PI from '@/components/atoms/icons/PI.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import fluentApi from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ProjectModel } from '@/lib/fluent-api/identity/project';
import { AxiosResponse } from 'axios';
import { useStore } from '@/store/toolset';
import { ProviderListResp } from '@/lib/fluent-api/identity/provider';


interface ProjectSummary{
        cloudService: number;
        server: number;
        members: number;
}

interface Summary {
        [id: string]: ProjectSummary;
}

interface ProjectCardData{
        projectGroupName: string;
        projectId: string;
        projectName: string;
        providers: string[];
        extraProviders: number;
        summary?: ProjectSummary;
}

interface State {
        item: any;
        items: ProjectCardData[];
}

export default defineComponent({
    name: 'Project2',
    components: {
        PVerticalPageLayout2,
        PContextMenu,
        PTree,
        PTab,
        PHorizontalLayout,
        PDynamicView,
        PDynamicDetails,
        PI,
        PEmpty,
        PGridLayout,
    },
    setup(props, context) {
        const state: UnwrapRef<State> = reactive({
            item: [],
            items: [],
        });
        const summary = ref<Summary>({});

        const { provider } = useStore();
        provider.getProvider();

        /**
             Api Handler
             */
        const treeAction = fluentApi.identity().project().tree()
            .setSortBy('item_type')
            .setExcludeProject();
        const treeApiHandler = new ProjectTreeFluentAPI(treeAction, TreeToolSet);
        const projectAPI = fluentApi.identity().project();
        const projectGroupAPI = fluentApi.identity().projectGroup();
        const generateRandom = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        const getSummary = (id: string) => {
            if (!summary.value[id]) {
                setTimeout(() => {
                    console.debug('start get summary', id);
                    summary.value = {
                        ...summary.value,
                        [id]: {
                            cloudService: generateRandom(3, 20),
                            server: generateRandom(3, 20),
                            members: generateRandom(3, 8),
                        },
                    };
                    console.debug(summary.value);
                }, generateRandom(300, 5000));
            }
        };
        const selected = async (item) => {
            treeApiHandler.ts.getSelectedNode(item);
            const projectGroupId = item.data.id;
            state.items = [];
            try {
                const res = await projectAPI.list().setFilter({
                    key: 'project_group_id',
                    value: projectGroupId,
                    operator: '=',
                }).setIncludeProvider().execute();
                state.items = res.data.results.map((it: ProjectModel) => {
                    const providers = (it.providers as string[]).map(name => _.get(provider.state.providers, [name, 'icon']));
                    providers.push(...providers, ...providers, ...providers);
                    const extraProviders = providers.length > 5 ? providers.length - 5 : 0;
                    return {
                        projectGroupName: it.project_group_info.name,
                        projectId: it.project_id,
                        projectName: it.name,
                        extraProviders,
                        providers: providers.splice(0, 5),
                    };
                });
                state.items.forEach((it) => {
                    getSummary(it.projectId);
                });
            } catch (e) {
                console.error(e);
            }
        };

        const cardItems = computed(() => state.items.map((item) => {
            console.log('card items', item);
            if (summary.value[item.projectId]) {
                item.summary = summary.value[item.projectId];
            }
            return item;
        }));
        return {
            treeRef: treeApiHandler.ts.treeRef,
            treeApiHandler,
            ...toRefs(state),
            selected,
            summary,
            cardItems,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .treeSidebar {
        height: 100%;
    }

    .right-container {
        width: 100%;
    }

    .empty {
        flex-direction: column;
        text-align: center;
        justify-content: flex-start;
    }
</style>
