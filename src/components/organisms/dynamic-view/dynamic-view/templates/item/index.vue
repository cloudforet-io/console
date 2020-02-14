<template>
    <p-dl class="content-container">
        <Definition v-for="(bind, idx) in defs" :key="idx" v-bind="bind" />
    </p-dl>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { createComponent, computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import PDl from '@/components/atoms/lists/dl-list/Dl.vue';
import Definition from './definition.vue';

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

const makeDefinitionBind = (props:Props): Ref<DefinitionBind[]> => computed(():DefinitionBind[] => props.data_source.map(obj => ({
    name: obj.name,
    view_type: obj.view_type || 'text',
    view_option: obj.view_option,
    data: _.get(props.data, obj.key),
})));


export default createComponent({
    name: 'PDynamicViewItem',
    components: {
        PDl,
        Definition,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
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
        return {
            defs: makeDefinitionBind(props),
        };
    },
});
</script>

<style scoped lang="scss">

.content-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;

}
.content {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
    .label {
        float: left;
        overflow: hidden;
        clear: left;
        text-align: left;
        word-break: break-word;
        padding: 0 1rem;
        text-align: left;
        font-weight: bold;
        color: $gray1;
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
