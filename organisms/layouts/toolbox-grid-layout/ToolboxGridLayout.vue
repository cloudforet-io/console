<template>
    <div class="grid-container">
        <div class="toolbox">
            <div v-if="$slots['toolbox-top']" class="toolbox-top">
                <slot name="toolbox-top" />
            </div>
            <div class="toolbox-middle">
                <div class="left" :style="{width: '100%'}">
                    <slot name="toolbox-left" />
                </div>
                <div v-if="$slots['toolbox-center']" class="center">
                    <slot name="toolbox-center" />
                </div>
                <div class="right">
                    <slot name="toolbox-right" />
                    <div v-if="pagenationVisible" class="tool">
                        <p-text-pagenation
                            :this-page.sync="proxyThisPage"
                            :all-page="allPage"
                            @pageChange="changePageNumber"
                        />
                    </div>
                    <div v-if="pageSizeVisible" class="tool">
                        <PDropdownMenuBtn
                            class="page-size-dropdown"
                            :menu="pageSizeOptions"
                            @clickMenuEvent="changePageSize"
                        >
                            {{ proxyPageSize }}
                        </PDropdownMenuBtn>
                    </div>
                    <div v-if="refreshVisible" class="tool">
                        <p-icon-button
                            name="ic_refresh"
                            @click="$emit('clickRefresh', $event)"
                        />
                    </div>
                </div>
            </div>
            <div v-if="$slots['toolbox-bottom']" class="toolbox-bottom">
                <slot name="toolbox-bottom" />
            </div>
        </div>
        <p-grid-layout v-bind="$props" v-on="$listeners">
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" />
            </template>
        </p-grid-layout>
        <div class="bottom">
            <slot name="bottom">
                <div class="bottom-page">
                    <p-text-pagenation :this-page.sync="proxyThisPage"
                                       :all-page="allPage"
                                       @pageChange="changePageNumber"
                    />
                </div>
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import PTextPagenation from '@/components/organisms/pagenations/textPagenation.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import { gridLayoutProps } from '@/components/molecules/layouts/grid-layout/toolset';

const setTools = (props, context) => {
    const state = reactive({
        proxyThisPage: makeProxy('thisPage', props, context.emit),
        proxyPageSize: makeProxy('pageSize', props, context.emit),
        pageSizeOptions: computed(() => (_.flatMap(props.pageNationValues, size => ({ type: 'item', label: size, name: size })))),
    });
    const changePageNumber = (page) => {
        state.proxyThisPage = page;
        context.emit('pageChange', page);
    };
    const changePageSize = (size) => {
        const sizeNum = Number(size);
        if (props.pageSize !== sizeNum) {
            state.proxyPageSize = sizeNum;
            state.proxyThisPage = 1;
            context.emit('changePageSize', sizeNum);
        }
    };
    return {
        ...toRefs(state),
        changePageNumber,
        changePageSize,
    };
};

export default {
    name: 'PToolboxGridLayout',
    components: {
        PGridLayout,
        PTextPagenation,
        PIconButton,
        PDropdownMenuBtn,
    },
    events: ['pageChange', 'clickMenuEvent', 'clickRefresh'],
    props: {
        ...gridLayoutProps,
        pagenationVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeVisible: {
            type: Boolean,
            default: true,
        },
        refreshVisible: {
            type: Boolean,
            default: true,
        },
        thisPage: {
            type: Number,
            // validator(value) {
            //     return value > 0;
            // },
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 12,
        },
        pageNationValues: {
            type: Array,
            default: () => [15, 30, 45],
        },
        allPage: {
            type: Number,
            default: 1,
        },
    },
    setup(props, context) {
        const toolState = setTools(props, context);

        return {
            ...toolState,
        };
    },

};
</script>

<style lang="postcss" scoped>
    .grid-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding-right: 1rem;
        padding-left: 1rem;

        .toolbox {
            margin-top: 0.5rem;

        .toolbox-middle{
            display: flex;
            justify-content: space-between;
            flex-wrap: nowrap;
            align-items: center;
            margin-bottom: 1rem;
                .left{
                    display: inline-flex;
                    flex-wrap: wrap;
                    width: auto;
                    justify-content: flex-start;
                }
                .right{
                    display: inline-flex;
                    flex-wrap:nowrap;
                    width: auto;
                    justify-content: flex-end;
                }
            }
        }
    }
    /*.toolbox {*/
    /*    !*display: flex;*!*/
    /*    !*justify-content: space-between;*!*/
    /*    !*align-items: center;*!*/

    /*    .left-top {*/
    /*        display: flex;*/
    /*        flex-wrap: wrap;*/
    /*        width: auto;*/
    /*        justify-content: flex-start;*/
    /*    }*/

    /*    .right-top {*/
    /*        display: inline-flex;*/
    /*        flex-wrap:nowrap;*/
    /*        width: auto;*/
    /*        justify-content: flex-end;*/
    /*    }*/
    /*}*/


    .bottom {
        margin-top: 1.6rem;
        text-align: center;
    }
</style>
