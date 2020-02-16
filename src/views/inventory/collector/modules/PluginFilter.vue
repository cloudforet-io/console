<template>
    <div class="plugin-filter-container">
        <p-row>
            <p-button class="back-btn" @click="$emit('goBack')">
                <p-i name="ic_back" color="transparent inherit" />Back
            </p-button>
        </p-row>
        <p-row>
            <p-col>
                <p-search class="p-search" :search-text.sync="search" search-placeholder="Enter keyword"
                          @onSearch="$emit('search', $event)"
                />
            </p-col>
        </p-row>
        <p-row direction="column">
            <header>Repository</header>
            <span v-for="(repo, idx) in repositories" :key="idx"
                  class="filter" :class="{selected: proxySelectedRepoId === repo.repository_id}"
                  @click.stop="onClickRepoText(repo.repository_id)"
            >
                <p-radio v-model="proxySelectedRepoId" :value="repo.repository_id" @change="onRepoChange(repo)" />
                {{ repo.name }}
            </span>
        </p-row>
        <p-row direction="column">
            <header>Resource Type</header>
            <span v-for="(resource) in resourceOptions" :key="resource"
                  class="filter" :class="{selected: proxyFilters.includes(resource)}"
                  @click.stop="onClickResourceText(resource)"
            >
                <p-check-box v-model="proxyFilters" :value="resource"
                             @change="onResourceChange"
                />
                {{ resource }}
            </span>
        </p-row>
    </div>
</template>

<script>
import { toRefs, reactive, computed } from '@vue/composition-api';

import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PRadio from '@/components/molecules/forms/radio/Radio.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'PluginFilter',
    events: ['goBack', 'search', 'repoChange', 'filtersChange'],
    components: {
        PRow,
        PCol,
        PI,
        PButton,
        PSearch,
        PRadio,
        PCheckBox,
    },
    props: {
        filters: {
            type: Array,
            default: () => [],
        },
        repositories: {
            type: Array,
            default: () => [],
        },
        selectedRepoId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, context) {
        const state = reactive({
            search: '',
            proxySelectedRepoId: makeProxy('selectedRepoId', props, context.emit),
            resourceOptions: [
                'Server', 'Network', 'Subnet', 'IP Address', 'Cloud Service',
            ],
        });

        const proxyFilters = makeProxy('filters', props, context.emit);

        const onRepoChange = (val) => {
            context.emit('repoChange', val);
        };

        const onClickRepoText = (val) => {
            state.proxySelectedRepoId = val;
            onRepoChange(val);
        };

        const onResourceChange = (selected) => {
            context.emit('filtersChange', selected);
        };

        const onClickResourceText = (val) => {
            if (proxyFilters.value.includes(val)) {
                _.remove(proxyFilters.value, item => item === val);
                proxyFilters.value = [...proxyFilters.value];
            } else proxyFilters.value.push(val);
            onResourceChange(proxyFilters.value);
        };

        return {
            ...toRefs(state),
            proxyFilters,
            onRepoChange,
            onClickRepoText,
            onResourceChange,
            onClickResourceText,
        };
    },
};
</script>

<style lang="scss" scoped>
.plugin-filter-container {
    padding: 0 1rem;
    .p-row {
         margin-top: 1.25rem;
     }
    .back-btn {
        color: $primary2;
        font-size: .875rem;
        height: 1.5rem;
        padding: 0;
        text-align: left;
    }
    .p-search {
        width: 100%;
    }
    header {
        font-size: .75rem;
        line-height: 2rem;
        font-weight: bold;
    }
    .filter {
        line-height: 1.5rem;
        margin-bottom: .5rem;
        cursor: pointer;
        &.selected {
            color: $secondary;
        }
        .p-radio {
            margin-right: .25rem;
        }
    }
}
</style>
