<template>
    <table v-if="!noData" class="content-table">
        <tbody>
            <Definition v-for="(bind, idx) in defs" :key="idx" class="def-row"
                        v-bind="bind"
            />
        </tbody>
    </table>
    <p-empty v-else class="p-emty">
        No Data
    </p-empty>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { defineComponent, computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import PDl from '@/components/atoms/lists/dl-list/Dl.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import Definition from './definition.vue';

interface DataSourceType {
    name: string;
    key: string;
    view_type?: string;
    view_option?: any;
}

interface Props {
    data_source: DataSourceType[];
    data: any;
    rootMode: boolean;
}

interface DefinitionBind {
    name: string;
    view_type: string;
    view_option: any;
    data: any;
}

const makeDefinitionBind = (props: Props): Ref<Readonly<DefinitionBind[]>> => computed((): DefinitionBind[] => props.data_source.map(obj => ({
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
    setup(props: Props) {
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

.content-table {
    @apply w-full ;
    border-spacing: 2px;
    tbody{
        >>>.def-row:nth-child(2n+1) {
            td{
                @apply bg-violet-100 border-l-2 border-white;

            }

        }
    }
}
.p-emty{
    padding-top: 2rem;
    padding-bottom: 2rem;
}
/*.content {*/
/*    display: flex;*/
/*    align-items: center;*/
/*    padding-bottom: 1rem;*/
/*    .label {*/
/*        @apply text-gray-400;*/
/*        float: left;*/
/*        overflow: hidden;*/
/*        clear: left;*/
/*        text-align: left;*/
/*        word-break: break-word;*/
/*        padding: 0 1rem;*/
/*        text-align: left;*/
/*        font-weight: bold;*/
/*        min-width: 10rem;*/

/*    }*/
/*    .label-common {*/
/*        width: 25%;*/
/*    }*/
/*    .label-full {*/
/*        width: 12.5%;*/
/*    }*/

/*    .data {*/
/*        flex: 1;*/
/*        display: flex;*/
/*        align-items: center;*/
/*        text-align: left;*/
/*        color: #222532;*/
/*        opacity: 1;*/
/*        dd {*/
/*            margin: 0;*/
/*        }*/
/*    }*/
/*    .copy-btn::v-deep {*/
/*        flex: 1;*/
/*        height: 1rem;*/
/*        .p-copy-btn {*/
/*            top: -.3rem;*/
/*        }*/
/*    }*/
/*}*/
</style>
