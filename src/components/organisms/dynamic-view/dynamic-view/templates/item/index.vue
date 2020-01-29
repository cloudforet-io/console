<template>
    <Fragment>
        <div class="p-dynamic-view-item-header">
            <div class="title">
                {{ name }}
            </div>
            <PHr />
        </div>
        <PDl class="content-container">
            <Definition v-for="(bind, idx) in defs" :key="idx" v-bind="bind" />
        </PDl>
    </Fragment>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { createComponent, computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import { Fragment } from 'vue-fragment';
import PDl from '@/components/atoms/lists/dl-list/Dl.vue';
import Definition from './definition.vue';
import PHr from '@/components/atoms/hr/Hr.vue';

interface DataSourceType {
    name:string;
    key:string;
    view_type?:string;
    view_option?:any;
}

interface Props {
    data_source: DataSourceType[];
    keyPath: string;
    data: any;
    rootMode:boolean;
}

interface DefinitionBind {
    name:string;
    view_type:string;
    view_option:any;
    data:any;
}

const makeDefinitionBind = (props:Props): Ref<DefinitionBind[]> => computed(():DefinitionBind[] => props.data_source.map((obj) => {
    let paths:string[] = obj.key.split('.');
    if (!props.rootMode) {
        paths = paths.splice(1);
    }

    return {
        name: obj.name,
        view_type: obj.view_type || 'text',
        view_option: obj.view_option,
        data: _.get(props.data, paths),
    };
}));


export default createComponent({
    name: 'PDynamicViewItem',
    components: {
        PDl,
        Definition,
        Fragment,
        PHr,
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
        key_path: {
            type: String,
            required: true,
        },
        data: {
            type: Object,
            required: true,
        },
        rootMode: {
            type: Boolean,
            default: false,
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
.p-dynamic-view-item-header{
    margin-bottom: 1rem;
    .title{
        display: flex;
        text-align: left;
        font:  18px Arial;
        letter-spacing: 0;
        color: #202433;
        opacity: 1;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        align-self:center;
    }
}
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
