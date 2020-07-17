<template>
    <div class="plugin-filter-container">
        <div class="rows">
            <p-search class="p-search" v-model="search" placeholder="Enter keyword"
                      @search="$emit('search', $event)"
            />
        </div>
        <div class="rows">
            <header>Repository</header>
            <!--            <div v-for="(repo, idx) in repositories" :key="idx"-->
            <!--                 class="filter" :class="{selected: proxySelectedRepoId === repo.repository_id}"-->
            <!--                 @click.stop="onClickRepoText(repo.repository_id)"-->
            <!--            >-->
            <!--                <p-radio v-model="proxySelectedRepoId" :value="repo.repository_id" />-->
            <!--                {{ repo.name }}-->
            <!--            </div>-->
            <div v-for="(repo, idx) in repositories" :key="idx"
                 class="filter" :class="{selected: proxySelectedRepoId === repo.repository_id}"
                 @click.stop="onClickRepoText(repo.repository_id)"
            >
                <p-radio v-model="proxySelectedRepoId" :value="repo.repository_id" />
                {{ repo.name }}
            </div>
        </div>
        <div class="rows">
            <header>Resource Type</header>
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
import { toRefs, reactive } from '@vue/composition-api';

import PSearch from '@/components/molecules/search/PSearch.vue';
import PRadio from '@/components/molecules/forms/radio/Radio.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import { makeProxy } from '@/lib/compostion-util';
import _ from 'lodash';

export default {
    name: 'PluginFilter',
    components: {
        PSearch,
        PRadio,
        PCheckBox,
    },
    props: {
        queryTagTool: {
            type: Object,
        },
        repositories: {
            type: Array,
            default: () => [],
        },
        /** sync */
        selectedRepoId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, context) {
        const state = reactive({
            search: '',
            proxySelectedRepoId: makeProxy('selectedRepoId', props, context.emit),
            resourceOptions: _.zipObject([
                'Server', 'Network', 'Subnet', 'IP Address', 'Cloud Service',
            ], new Array(5).fill(false)),
            // selectedResources: computed(() => _.keyBy(state.resourceOptions, (v, k) => )),
        });


        const onClickRepoText = (val) => {
            state.proxySelectedRepoId = val;
        };

        const onClickResourceText = (val) => {
            state.resourceOptions[val] = !state.resourceOptions[val];
            const itemIdx = _.findIndex(props.queryTagTool.tags.value, { value: val });
            if (itemIdx > -1) {
                props.queryTagTool.deleteTag(itemIdx);
            } else props.queryTagTool.addTag({ key: 'labels', value: val, operator: '=' });
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
        font-size: .875rem;
        &.selected {
            @apply text-secondary;
        }
        .p-radio {
            margin-right: 0.25rem;
        }
    }
}
</style>
