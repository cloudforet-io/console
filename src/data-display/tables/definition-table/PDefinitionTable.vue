<template>
    <div class="p-definition-table" :class="styleType">
        <p-empty v-if="!loading && isNoData" class="no-data">
            <slot name="no-data">
                {{ $t('COMPONENT.DEFINITION_TABLE.NO_DATA') }}
            </slot>
        </p-empty>
        <table v-else-if="!isNoData">
            <tbody>
                <p-definition v-for="(item, idx) in items" :key="`${contextKey}-${idx}`"
                              class="def-row"
                              :label="item.label"
                              :name="item.name"
                              :data="item.data"
                              :disable-copy="disableCopy || item.disableCopy"
                              :formatter="item.formatter"
                              :block="block || item.block"
                >
                    <template #default="scope">
                        <slot name="data" v-bind="{
                            ...scope, index: idx, items}"
                        >
                            <slot :name="`data-${item.name}`"
                                  v-bind="{...scope, index: idx, items}"
                            >
                                <slot :name="`data-${idx}`"
                                      v-bind="{...scope, index: idx, items}"
                                >
                                    {{ scope.value }}
                                </slot>
                            </slot>
                        </slot>
                    </template>
                    <template v-if="$scopedSlots.key" #key="scope">
                        <slot name="key" v-bind="{...scope, index: idx, items}" />
                    </template>
                    <template v-if="$scopedSlots.extra" #extra="scope">
                        <slot name="extra" v-bind="scope" />
                    </template>
                </p-definition>
            </tbody>
        </table>

        <div v-if="loading" class="loading-backdrop fade-in" />
        <div v-if="loading" class="loading">
            <slot name="loading">
                <p-lottie name="thin-spinner" :size="2.5"
                          auto
                />
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { every, range, get } from 'lodash';

import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    DefinitionTableProps, DefinitionData, DefinitionField,
} from '@/data-display/tables/definition-table/type';
import PDefinition from '@/data-display/tables/definition-table/definition/PDefinition.vue';
import PLottie from '@/foundation/lottie/PLottie.vue';
import PEmpty from '@/data-display/empty/PEmpty.vue';
import { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';
import { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';

const makeDefItems = (fields: DefinitionField[], data?: DefinitionData): DefinitionProps[] => fields.map(field => ({
    ...field,
    data: get(data, field.name, ''),
}));


export default defineComponent<DefinitionTableProps>({
    name: 'PDefinitionTable',
    components: {
        PLottie, PEmpty, PDefinition,
    },
    props: {
        fields: {
            type: Array,
            default: () => [],
        },
        data: {
            type: Object,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        skeletonRows: {
            type: Number,
            default: 5,
        },
        disableCopy: {
            type: Boolean,
            default: false,
        },
        styleType: {
            type: String,
            default: DEFINITION_TABLE_STYLE_TYPE.primary,
            validator(styleType: any) {
                return Object.values(DEFINITION_TABLE_STYLE_TYPE).includes(styleType);
            },
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: DefinitionTableProps, { emit, slots }) {
        const state = reactive({
            contextKey: Math.floor(Math.random() * Date.now()),
            isNoData: computed(() => every(state.items, def => !def.data)),
            skeletons: computed(() => range(props.skeletonRows ?? 5)),
            items: computed(() => makeDefItems(props.fields, props.data)),
        });

        watch([() => props.data, () => props.fields], () => {
            state.contextKey = Math.floor(Math.random() * Date.now());
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-definition-table {
    min-height: 11.25rem;
    .no-data {
        min-height: 11.25rem;
    }
    table {
        @apply w-full;
        table-layout: fixed;
        td {
            line-height: 1.8;
            word-break: break-word;
        }
    }
    .def-row {
        td:first-child {
            @apply border-r-2;
        }
    }
    .loading-backdrop {
        @apply absolute w-full h-full overflow-hidden;
        background-color: rgba(theme('colors.white'), 0.5);
        top: 0;
        z-index: 1;
    }
    .loading {
        @apply absolute flex w-full h-full justify-center items-center;
        top: 0;
        max-height: 10rem;
        z-index: 2;
    }

    /* style types */
    @define-mixin style-type $table-border-color, $stripe-bg-color, $row-border-color, $key-border-color {
        table {
            td {
                border-color: $table-border-color;
            }
            tr {
                border-color: $row-border-color;
            }
        }
        .def-row {
            &:nth-child(2n+1) {
                background-color: $stripe-bg-color;
            }
            td:first-child {
                border-color: $key-border-color;
            }
        }
    }

    &.primary {
        @mixin style-type theme('colors.white'), theme('colors.violet.100'), transparent, theme('colors.white');
    }
    &.white {
        @mixin style-type theme('colors.white'), theme('colors.white'), theme('colors.gray.300'), theme('colors.white');
        @apply rounded-lg border border-gray-200;
        table {
            tr {
                @apply border-b;
                &:first-of-type {
                    @apply rounded-t-lg;
                }
                &:last-of-type {
                    @apply rounded-b-lg border-b-0;
                }
            }
        }
    }

    /* transitions */

    .fade-in-enter-active {
        transition: opacity 0.2s;
    }
    .fade-in-leave-active {
        transition: opacity 0.2s;
    }
    .fade-in-enter, .fade-in-leave-to {
        opacity: 0;
    }
    .fade-in-leave, .fade-in-enter-to {
        opacity: 0.5;
    }

    /* responsive */

    @screen mobile {
        .def-row {
            td:first-child {
                @apply border-r-0;
            }
        }
    }
}
</style>
