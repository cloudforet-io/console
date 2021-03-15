<template>
    <p-button-modal scrollable
                    centered
                    size="lg"
                    fade
                    backdrop
                    header-visible
                    body-visible
                    :footer-visible="false"
                    :visible.sync="proxyVisible"
    >
        <template #header>
            <span class="header-title">
                {{ $t('COMPONENT.QUERY_SEARCH_GUIDE.TITLE') }}
            </span>
            <p-i name="ic_delete" color="transparent inherit"
                 class="close-btn"
                 @click.stop="onClickClose"
            />
        </template>
        <template #body>
            <div class="flex flex-col">
                <div class="step-wrapper">
                    <span class="number">1.</span>
                    <div>
                        <i18n path="COMPONENT.QUERY_SEARCH_GUIDE.STEP_1">
                            <template #queryKey>
                                <strong>{{ $t('COMPONENT.QUERY_SEARCH_GUIDE.QUERY_KEY') }}</strong>
                            </template>
                        </i18n>
                        <img src="images/help_search_key.gif" width="248px" height="117px"
                             class="help-search-img"
                        >
                    </div>
                </div>
                <div class="step-wrapper">
                    <span class="number">2.</span>
                    <div>
                        <i18n path="COMPONENT.QUERY_SEARCH_GUIDE.STEP_2_1">
                            <template #filter>
                                <strong>{{ $t('COMPONENT.QUERY_SEARCH_GUIDE.FILTER') }}</strong>
                            </template>
                        </i18n>
                        <br>
                        {{ $t('COMPONENT.QUERY_SEARCH_GUIDE.STEP_2_2') }}
                        <img src="images/help_search_filter.gif" width="643px" height="114px"
                             class="help-search-img"
                        >
                    </div>
                </div>
                <div class="step-wrapper third">
                    <span class="number">3.</span>
                    <div>
                        <i18n path="COMPONENT.QUERY_SEARCH_GUIDE.STEP_3">
                            <template #operator>
                                <strong>{{ $t('COMPONENT.QUERY_SEARCH_GUIDE.OPERATOR') }}</strong>
                            </template>
                        </i18n>
                        <table class="search-operator-table">
                            <tr v-for="(value, index) in operators" :key="index">
                                <td class="left-content">
                                    <span class="search-key">key</span>
                                    <span class="search-operator">{{ value.operator }}</span>
                                    <span class="search-operand">{{ value.operand }}</span>
                                </td>
                                <td>
                                    <span>{{ value.value }} </span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <span class="contact">
                <i18n path="COMPONENT.QUERY_SEARCH_GUIDE.HELP">
                    <template #contact>
                        <p-anchor href="mailto:support@spaceone.dev" target="_blank"
                                  :show-icon="false" highlight
                        >
                            {{ $t('COMPONENT.QUERY_SEARCH_GUIDE.CONTACT') }}
                        </p-anchor>
                    </template>
                </i18n>
            </span>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import PI from '@/foundation/icons/PI.vue';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/util/composition-helpers';
import PAnchor from '@/inputs/anchors/PAnchor.vue';

export default {
    name: 'PQuerySearchGuide',
    components: { PAnchor, PI, PButtonModal },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
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
.step-wrapper {
    @apply flex;
    line-height: 1.5;
}
.number {
    @apply font-bold text-sm text-gray-500 flex-shrink-0;
    margin-right: 0.6875rem;
}
.help-search-img {
    @apply border border-gray-200;
    margin-top: 0.625rem;
    margin-bottom: 2.5rem;
    padding: 2px;
    border-radius: 2px;
}
.search-operator-table {
    @apply border border-gray-200;
    border-radius: 2px;
    width: 21rem;
    height: 14rem;
    margin-top: 0.625rem;
    margin-bottom: 0.5rem;
    tr:first-child td {
        @apply pt-4;
    }
    tr:last-child td {
        @apply pb-4;
    }
    td {
        @apply px-4 py-2 text-xs;
        line-height: 1.2;
    }
    .left-content {
        width: 6.125rem;
        border-right: 1px solid theme('colors.gray.200');
        margin-right: 1rem;
    }
    .search-key {
        @apply text-gray-400;
        margin-bottom: 1rem;
    }
    .search-operator {
        @apply text-gray-900;
    }
    .search-operand {
        @apply text-gray-400;
    }
}
.contact {
    @apply float-right text-gray-400 text-xs;
    margin-bottom: 1.875rem;
}
</style>
