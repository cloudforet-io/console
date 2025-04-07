<script setup lang="ts">
import { computed } from 'vue';

import { getTextHighlightRegex, PTextInput, PEmpty } from '@cloudforet/mirinae';

import { useProjectReferenceStore } from '@/store/reference/project-reference-store';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSBItem from '@/common/modules/navigations/new-lsb/LSBItem.vue';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

const props = defineProps<{
    keyword?: string;
}>();
const emit = defineEmits<{(e: 'update:keyword', value: string): void;
}>();

const projectReferenceStore = useProjectReferenceStore();
const projectFilteredByKeyword = computed(() => {
    const projectItems = Object.values(projectReferenceStore.getters.projectItems);
    return projectItems.filter((project) => getTextHighlightRegex(props.keyword).test(project.name));
});
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
                            :id="project.key"
                            :key="project.key"
                            :name="project.name"
                            :link="{
                                to: {
                                    name: PROJECT_ROUTE_V2._NAME,
                                    params: { projectGroupOrProjectId: project.key }
                                }
                            }"
                            :favorite-options="{ type: FAVORITE_TYPE.PROJECT, id: project.key }"
                            display-type="list"
                            icon="ic_project-filled"
                />
            </template>
            <p-empty v-else
                     class="text-paragraph-md whitespace-pre mt-3"
            >
                {{ $t('PROJECT.LANDING.SEARCH_EMPTY_TEXT') }}
            </p-empty>
        </template>
    </div>
</template>
