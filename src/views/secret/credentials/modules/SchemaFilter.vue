<template>
    <div class="schema-filter-container">
        <div class="rows">
            <header>Secret Type</header>
            <div v-for="(scheme, idx) in allSchema" :key="idx"
                 class="filter" :class="{selected: proxySelectedSchemaId === scheme.schema_id}"
                 @click.stop="onClickSchemaText(scheme.schema_id)"
            >
                <p-radio v-model="proxySelectedSchemaId" :value="scheme.schema_id" @change="onSchemaChange(scheme)" />
                {{ scheme.name }}
            </div>
        </div>
    </div>
</template>

<script>
import { toRefs, reactive, computed } from '@vue/composition-api';

import PRadio from '@/components/molecules/forms/radio/PRadio.vue';

import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'SchemaFilter',
    events: ['schemaChange'],
    components: {
        PRadio,
    },
    props: {
        filters: {
            type: Array,
            default: () => [],
        },
        schema: {
            type: Array,
            default: () => [],
        },
        selectedSchemaId: {
            type: String,
            default: null,
        },
    },
    setup(props, context) {
        const state = reactive({
            search: '',
            allSchema: computed(() => [{ schema_id: null, name: 'All' }, ...props.schema]),
            proxySelectedSchemaId: makeProxy('selectedSchemaId', props, context.emit),
        });


        const onSchemaChange = (val) => {
            context.emit('schemaChange', val);
        };

        const onClickSchemaText = (val) => {
            state.proxySelectedSchemaId = val;
            onSchemaChange(val);
        };

        return {
            ...toRefs(state),
            onSchemaChange,
            onClickSchemaText,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .schema-filter-container {
        padding: 0 1rem;
    .rows {
        margin-top: 1.25rem;
    }
    .back-btn {
        @apply text-primary2;
        font-size: .875rem;
        height: 1.5rem;
        padding: 0;
        justify-content: flex-start;
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
         @apply text-secondary;
     }
    .p-radio {
        margin-right: .25rem;
    }
    }
    }
</style>
