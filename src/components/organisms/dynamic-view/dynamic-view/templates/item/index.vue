<template>
    <p-dl v-if="!noData" class="content-container">
        <Definition v-for="(bind, idx) in defs" :key="idx" v-bind="bind" />
    </p-dl>
    <p-empty v-else class="p-emty">
        No Data
    </p-empty>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { defineComponent, computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import PDl from '@/components/atoms/lists/dl-list/Dl.vue';
import Definition from './definition.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';

interface DataSourceType {
    name:string;
    key:string;
    view_type?:string;
    view_option?:any;
}

interface Props {
    data_source: DataSourceType[];
    data: any;
    rootMode:boolean;
}

interface DefinitionBind {
    name:string;
    view_type:string;
    view_option:any;
    data:any;
}

const makeDefinitionBind = (props:Props): Ref<Readonly<DefinitionBind[]>> => computed(():DefinitionBind[] => props.data_source.map(obj => ({
    name: obj.name,
    view_type: obj.view_type || 'text',
    view_option: obj.view_option,
    data: _.get(props.data, obj.key),
})));


export default defineComponent({
    name: 'PDynamicViewItem',
    components: {
        PDl,
        Definition,
        PEmpty,
    },
    props: {
        // eslint-disable-next-line
        key_path: {
            type: String,
            default: '',
        },
        // eslint-disable-next-line
        data_source: {
            type: Array,
            required: true,
        },
        data: {
            type: Object,
            required: true,
        },
    },
    setup(props:Props) {
        const defs = makeDefinitionBind(props);
        const noData = computed(() => _.every(defs.value, def => !def.data));
        return {
            defs,
            noData,
        };
    },
});
</script>

<style lang="postcss" scoped>

.content-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;

}
.p-emty{
    padding-top: 2rem;
    padding-bottom: 2rem;
}
.content {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
    .label {
        @apply text-gray-400;
        float: left;
        overflow: hidden;
        clear: left;
        text-align: left;
        word-break: break-word;
        padding: 0 1rem;
        text-align: left;
        font-weight: bold;
        min-width: 10rem;

    }
    .label-common {
        width: 25%;
    }
    .label-full {
        width: 12.5%;
    }

    .data {
        flex: 1;
        display: flex;
        align-items: center;
        text-align: left;
        color: #222532;
        opacity: 1;
        dd {
            margin: 0;
        }
    }
    .copy-btn::v-deep {
        flex: 1;
        height: 1rem;
        .p-copy-btn {
            top: -.3rem;
        }
    }
}
</style>
