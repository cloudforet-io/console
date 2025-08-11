<script setup lang="ts">
import { computed } from 'vue';

import {
    getTextHighlightRegex, PTextInput, PEmpty, PTextHighlighting,
} from '@cloudforet/mirinae';
import type { TreeNodeRoutePredicate } from '@cloudforet/mirinae/types/data-display/tree/new-tree/type';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSBItem from '@/common/modules/navigations/new-lsb/LSBItem.vue';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';

const props = defineProps<{
    keyword?: string;
}>();
const emit = defineEmits<{(e: 'update:keyword', value: string): void;
}>();

const projectListStore = useProjectListStore();
const projectFilteredByKeyword = computed(() => projectListStore.projects.filter((project) => getTextHighlightRegex(props.keyword).test(project.name)));
const predicate: TreeNodeRoutePredicate = (to, curr) => to.params?.projectGroupOrProjectId === curr.params.projectGroupOrProjectId;
</script>

<template>
    <div>
        <p-text-input :value="props.keyword"
                      class="!w-full mb-2"
                      placeholder="Search project"
                      @update:value="emit('update:keyword', $event)"
        />
        <template v-if="props.keyword">
            <template v-if="projectFilteredByKeyword.length">
                <l-s-b-item v-for="project in projectFilteredByKeyword"
                            :id="project.project_id"
                            :key="project.project_id"
                            :name="project.name"
                            :link="{
                                to: {
                                    name: PROJECT_ROUTE_V2._NAME,
                                    params: { projectGroupOrProjectId: project.project_id }
                                },
                                predicate
                            }"
                            :favorite-options="{ type: FAVORITE_TYPE.PROJECT, id: project.project_id }"
                            display-type="list"
                            icon="ic_project-filled"
                >
                    <p-text-highlighting :text="project.name"
                                         :term="props.keyword"
                    />
                </l-s-b-item>
            </template>
            <p-empty v-else
                     class="text-paragraph-md whitespace-pre mt-3"
            >
                {{ $t('PROJECT.LANDING.SEARCH_EMPTY_TEXT') }}
            </p-empty>
        </template>
    </div>
</template>
