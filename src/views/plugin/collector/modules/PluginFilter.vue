<template>
    <div class="plugin-filter-container">
        <div class="rows">
            <header>{{ $t('PLUGIN.COLLECTOR.PLUGINS.SEARCH') }}</header>
            <p-divider class="sidebar-divider" />
            <p-search v-model="search" class="p-search" :placeholder="$t('PLUGIN.COLLECTOR.PLUGINS.SEARCH_PLACEHOLDER')"
                      @search="$emit('search', $event)"
                      @delete="$emit('delete')"
            />
        </div>
        <div class="rows">
            <header>{{ $t('PLUGIN.COLLECTOR.PLUGINS.REPOSITORY_LABEL') }}</header>
            <p-divider class="sidebar-divider" />
            <div v-for="(repo, idx) in repositories" :key="idx"
                 class="filter" :class="{selected: proxySelectedRepoId === repo.repository_id}"
                 @click.stop="onClickRepoText(repo.repository_id)"
            >
                <p-radio v-model="proxySelectedRepoId" :value="repo.repository_id" />
                {{ repo.name }}
            </div>
        </div>
        <div class="rows">
            <header>{{ $t('PLUGIN.COLLECTOR.PLUGINS.RESOURCE_TYPE_LABEL') }}</header>
            <p-divider class="sidebar-divider" />
            <div v-for="(checked, resource) in resourceOptions" :key="resource"
                 class="filter" :class="{selected: checked}"
                 @click.stop="onClickResourceText(resource)"
            >
                <p-check-box :selected="resourceOptions[resource]" :value="true" @change="onClickResourceText(resource)" />
                {{ resource }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed,
} from '@vue/composition-api';

import {
    PSearch, PRadio, PCheckBox, PDivider,
} from '@spaceone/design-system';

import { makeProxy } from '@/core-lib/compostion-util';

export default {
    name: 'PluginFilter',
    components: {
        PSearch,
        PRadio,
        PCheckBox,
        PDivider,
    },
    props: {
        repositories: {
            type: Array,
            default: () => [],
        },
        /** sync */
        selectedRepoId: {
            type: String,
            default: undefined,
        },
        resourceTypeSearchTags: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            search: '',
            proxySelectedRepoId: makeProxy('selectedRepoId', props, emit),
            resourceOptions: computed(() => ({
                Server: props.resourceTypeSearchTags.includes('Server'),
                'Cloud Service': props.resourceTypeSearchTags.includes('Cloud Service'),
            })),
        });

        const onClickRepoText = (val) => {
            state.proxySelectedRepoId = val;
        };
        const onClickResourceText = (val) => {
            const idx = props.resourceTypeSearchTags.indexOf(val);
            if (idx > -1) {
                props.resourceTypeSearchTags.splice(idx, 1);
            } else {
                props.resourceTypeSearchTags.push(val);
            }
        };

        return {
            ...toRefs(state),
            onClickRepoText,
            onClickResourceText,
        };
    },
};
</script>

<style lang="postcss" scoped>
.plugin-filter-container {
    padding: 0.5rem 0;
    .rows {
        margin-top: 1.25rem;
        .sidebar-divider {
          @apply w-full;
          margin-top: 0.5625rem;
          margin-bottom: .75rem;
        }
    }
    .back-btn {
        @apply text-primary2;
        font-size: 0.875rem;
        height: 1.5rem;
        padding: 0;
        justify-content: flex-start;
    }
    .p-search {
        width: calc(100% - 1.5rem);
        margin: 0 auto;
    }
    header {
        @apply text-gray-900;
        padding: 0 1rem;
        font-size: 0.875rem;
        line-height: 1.6;
        font-weight: bold;
    }
    .filter {
        padding: 0 1rem;
        line-height: 1.6;
        margin-bottom: 0.37rem;
        cursor: pointer;
        font-size: 0.875rem;
        &.selected {
            @apply text-secondary;
        }
        .p-radio {
            margin-right: 0.25rem;
        }
    }
}
</style>
