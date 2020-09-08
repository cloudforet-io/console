<template>
    <p-content-modal
        :scrollable="true"
        :centered="true"
        :size="'lg'"
        :fade="true"
        :backdrop="true"
        :header-visible="true"
        :body-visible="true"
        :footer-visible="false"
        :visible.sync="proxyVisible"
    >
        <template #header>
            <span class="header-title">
                Search Guide
            </span>
            <p-i name="ic_delete" color="transparent inherit"
                 class="close-btn"
                 @click.stop="onClickClose"
            />
        </template>
        <template #body>
            <div class="flex flex-col">
                <div class="first">
                    <span class="number">1.</span> Select a refined filter <b>query(key)</b> and use specific words.
                    <img src="@/assets/help guide/help_search_key.gif" width="248px" height="117px"
                         class="help-search-img"
                    >
                </div>
                <div class="second">
                    <span class="number">2.</span> Add and Delete <b>filters</b> to narrow your results.<br>
                    <span class="wrapped-text">OR Search for the same filters, And Search for different filters.</span>
                    <img src="@/assets/help guide/help_search_filter.gif" width="643px" height="114px"
                         class="help-search-img"
                    >
                </div>
                <div class="third">
                    <span class="number">3.</span> We support below <b>operators.</b>
                    <table class="search-operator">
                        <tr>
                            <td class="left-content">
                                <div v-for="(value, index) in operators" :key="index" class="pb-4">
                                    <span id="search-key">key</span>
                                    <span id="search-operator">{{ value.operator }}</span>
                                    <span id="search-operand">{{ value.operand }}</span>
                                </div>
                            </td>
                            <td class="right-content">
                                <div v-for="(value, index) in operators" :key="index" class="pb-4">
                                    <span id="search-value">{{ value.value }} </span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <span class="contact">
                Need more help? <a target="_blank" href="mailto:support@spaceone.dev">contact us</a>
            </span>
        </template>
    </p-content-modal>
</template>

<script lang="ts">
import PContentModal from '@/components/organisms/modals/content-modal/PContentModal.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/components/util/composition-helpers';
import PHr from '@/components/atoms/hr/PHr.vue';

export default {
    name: 'PQuerySearchGuide',
    components: { PHr, PI, PContentModal },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
            operators: [
                {
                    operator: ':', operand: 'value', value: 'Like',
                },
                {
                    operator: ':=', operand: 'value', value: 'Equal',
                },
                {
                    operator: ':>', operand: 'value', value: 'Greater than',
                },
                {
                    operator: ':<', operand: 'value', value: 'Less than',
                },
                {
                    operator: ': null', operand: '', value: 'Null',
                },
                {
                    operator: ':! null', operand: '', value: 'Not Null',
                },
                {
                    operator: ':$', operand: 'value', value: 'Regular Expression',
                },
            ],
        });
        const onClickClose = () => {
            state.proxyVisible = false;
            context.emit('close');
        };
        return {
            ...toRefs(state),
            onClickClose,
        };
    },

};
</script>

<style lang="postcss" scoped>
    .header-title {
        line-height: 120%;
    }
    .close-btn {
        @apply float-right cursor-pointer text-gray-900;
        &:hover {
            @apply text-secondary;
        }
    }
    .number {
        @apply font-bold text-sm;
        margin-right: 0.6875rem;
    }
    .help-search-img {
        margin-top: 0.625rem;
        margin-bottom: 2.5rem;
        margin-left: 1.625rem;
    }
    .wrapped-text {
        margin-left: 1.625rem;
    }
    .search-operator {
        @apply border border-gray-200;
        border-radius: 2px;
        width: 21rem;
        height: 14rem;
        margin-top: 0.625rem;
        margin-left: 1.625rem;
        margin-bottom: 0.5rem;
    }
    .third {
        .left-content {
            @apply text-xs;
            padding-top: 1rem;
            width: 6.125rem;
            border-right: 1px solid theme('colors.gray.200');;
            margin-right: 1rem;
            padding-left: 1rem;
            #search-key {
                @apply text-gray-400;
                margin-bottom: 1rem;
            }
            #search-operator {
                @apply text-gray-900;
            }
            #search-operand {
                @apply text-gray-400;
            }
        }
        .right-content {
            @apply text-xs;
            padding-top: 1rem;
            padding-left: 1rem;
        }
    }
    .contact {
        @apply float-right text-gray-400 text-xs;
        margin-bottom: 1.875rem;
    }
</style>
