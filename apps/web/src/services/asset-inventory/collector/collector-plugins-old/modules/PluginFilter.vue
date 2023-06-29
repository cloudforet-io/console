<script lang="ts" setup>
import {
    PRadio,
    // PCheckbox, PDivider
} from '@spaceone/design-system';
import {
    reactive,
    // computed,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useProxyValue } from '@/common/composables/proxy-state';

import type { RepositoryModel } from '@/services/asset-inventory/collector/collector-plugins-old/type';

interface Props {
    repositories: RepositoryModel[];
    selectedRepoId?: string;
    resourceTypeSearchTags: string[];
}

const props = withDefaults(defineProps<Props>(), {
    repositories: () => [],
    selectedRepoId: undefined,
    resourceTypeSearchTags: () => [],
});
const emit = defineEmits<{(e: 'update:selected-repo-id', value: string): void}>();
const { t } = useI18n();

const state = reactive({
    proxySelectedRepoId: useProxyValue('selectedRepoId', props, emit),
    // resourceOptions: computed(() => ({
    //     Server: props.resourceTypeSearchTags.includes('Server'),
    //     'Cloud Service': props.resourceTypeSearchTags.includes('Cloud Service'),
    // })),
});

const handleClickRepoText = (val) => {
    state.proxySelectedRepoId = val;
};
// const handleClickResourceText = (val) => {
//     const idx = props.resourceTypeSearchTags.indexOf(val);
//     if (idx > -1) {
//         props.resourceTypeSearchTags.splice(idx, 1);
//     } else {
//         props.resourceTypeSearchTags.push(val);
//     }
// };

</script>

<template>
    <div class="plugin-filter-container">
        <div class="cols">
            <span class="header">{{ t('PLUGIN.COLLECTOR.PLUGINS.REPOSITORY_LABEL') }}</span>
            <span v-for="repo in repositories"
                  :key="repo.repository_id"
                  class="filter"
                  :class="{selected: state.proxySelectedRepoId === repo.repository_id}"
                  @click.stop="handleClickRepoText(repo.repository_id)"
            ><p-radio v-model="state.proxySelectedRepoId"
                      :value="repo.repository_id"
            />{{ repo.name }}</span>
        </div>
        <!--        <p-divider class="divider" :vertical="true" />-->
        <!--        <div class="cols">-->
        <!--            <span class="header ml-2">{{ $t('PLUGIN.COLLECTOR.PLUGINS.RESOURCE_TYPE_LABEL') }}</span>-->
        <!--            <span v-for="(checked, resource) in resourceOptions" :key="resource"-->
        <!--                  class="filter" :class="{selected: checked}"-->
        <!--                  @click.stop="handleClickResourceText(resource)"-->
        <!--            >-->
        <!--                <p-checkbox :selected="resourceOptions[resource]" :value="true" @change="handleClickResourceText(resource)" />-->
        <!--                {{ resource }}-->
        <!--            </span>-->
        <!--        </div>-->
    </div>
</template>

<style lang="postcss" scoped>
.plugin-filter-container {
    @apply flex mb-4;
    .header {
        @apply text-gray-900;
        margin-right: 0.625rem;
        font-size: 0.875rem;
        line-height: 1.6;
        font-weight: bold;
    }
    .filter {
        line-height: 1.6;
        margin-right: 0.5rem;
        cursor: pointer;
        font-size: 0.875rem;
        &.selected {
            @apply text-secondary;
        }
        .p-radio {
            display: inline-block;
            margin-right: 0.25rem;
            margin-bottom: 0.25rem;
        }
    }
    .divider {
        margin: 0 0.5rem;
    }
}
</style>
