<template>
    <div class="plugin-filter-container">
        <p-row>
            <p-button class="back-btn" @click="$emit('goBack')">
                <p-i name="ic_back" color="transparent inherit" />Back
            </p-button>
        </p-row>
        <p-row>
            <p-col>
                <p-search class="p-search" :search-text.sync="search" @onSearch="$emit('search', $event)" />
            </p-col>
        </p-row>
        <p-row direction="column">
            <header>Repository</header>
            <span v-for="(label, repo) in repoOptions" :key="repo"
                  class="filter" :class="{selected: selectedRepo === repo}"
            >
                <p-radio :value="selectedRepo === repo" @change="onRepoChange(repo)" />
                {{ label }}
            </span>
        </p-row>
        <p-row direction="column">
            <header>Resource Type</header>
            <span v-for="(resource) in resourceOptions" :key="resource"
                  class="filter" :class="{selected: selectedResources.includes(resource)}"
            >
                <p-check-box v-model="selectedResources" :value="resource"
                             @change="$emit('resourceChange', $event)"
                />
                {{ resource }}
            </span>
        </p-row>
    </div>
</template>

<script>
import { toRefs, reactive } from '@vue/composition-api';

import PRow from '@/components/atoms/grid/row/Row';
import PCol from '@/components/atoms/grid/col/Col';
import PI from '@/components/atoms/icons/PI';
import PButton from '@/components/atoms/buttons/Button';
import PSearch from '@/components/molecules/search/Search';
import PRadio from '@/components/molecules/forms/radio/Radio';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox';


export default {
    name: 'PluginFilter',
    events: ['goBack', 'search', 'repoChange', 'resourceChange'],
    components: {
        PRow,
        PCol,
        PI,
        PButton,
        PSearch,
        PRadio,
        PCheckBox,
    },
    setup(props, context) {
        const state = reactive({
            search: '',
            repoOptions: {
                official: 'Official',
                local: 'Local',
            },
            selectedRepo: 'official',
            resourceOptions: [
                'Server', 'Network', 'Subnet', 'IP Address',
            ],
            selectedResources: [],
        });

        const onRepoChange = (val) => {
            state.selectedRepo = val;
            context.emit('repoChange', val);
        };

        return {
            ...toRefs(state),
            onRepoChange,
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
        &.selected {
            color: $secondary;
        }
        .p-radio {
            margin-right: .5rem;
        }
    }
}
</style>
