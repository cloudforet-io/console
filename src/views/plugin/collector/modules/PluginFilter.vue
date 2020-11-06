<template>
    <div class="plugin-filter-container">
        <div class="rows">
            <p-search v-model="search" class="p-search" :placeholder="$t('PLUGIN.COLLECTOR.PLUGINS.SEARCH_PLACEHOLDER')"
                      @search="$emit('search', $event)"
            />
        </div>
        <div class="rows">
            <header>{{ $t('PLUGIN.COLLECTOR.PLUGINS.REPOSITORY_LABEL') }}</header>
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
import { toRefs, reactive, computed } from '@vue/composition-api';

import PSearch from '@/components/molecules/search/PSearch.vue';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';

import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'PluginFilter',
    components: {
        PSearch,
        PRadio,
        PCheckBox,
    },
    props: {
        repositories: {
            type: Array,
            default: () => [],
        },
        searchKeyword: {
            type: String,
            default: '',
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
    padding: 0.5rem 1rem;
    .rows {
        margin-top: 1.25rem;
    }
    .back-btn {
        @apply text-primary2;
        font-size: 0.875rem;
        height: 1.5rem;
        padding: 0;
        justify-content: flex-start;
    }
    .p-search {
        width: 100%;
    }
    header {
        font-size: 0.75rem;
        line-height: 2rem;
        font-weight: bold;
    }
    .filter {
        line-height: 1.5rem;
        margin-bottom: 0.5rem;
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
