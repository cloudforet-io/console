<template>
    <p-data-loader class="p-definition-table"
                   :class="styleType"
                   :loading="loading"
                   :data="!isNoData"
    >
        <template #no-data>
            <slot name="no-data">
                {{ $t('COMPONENT.DEFINITION_TABLE.NO_DATA') }}
            </slot>
        </template>
        <table>
            <tbody>
                <p-definition v-for="(item, idx) in items"
                              :key="`${contextKey}-${idx}`"
                              class="def-row"
                              :label="item.label"
                              :name="item.name"
                              :data="item.data"
                              :disable-copy="disableCopy || item.disableCopy"
                              :formatter="item.formatter"
                              :block="block || item.block"
                              :custom-key-width="customKeyWidth || undefined"
                              :copy-value="item.copyValue"
                              :copy-value-formatter="item.copyValueFormatter"
                >
                    <template #default="scope">
                        <slot name="data"
                              v-bind="{
                                  ...scope, index: idx, items}"
                        >
                            <slot :name="`data-${item.name}`"
                                  v-bind="{...scope, index: idx, items}"
                            >
                                <slot :name="`data-${idx}`"
                                      v-bind="{...scope, index: idx, items}"
                                />
                            </slot>
                        </slot>
                    </template>
                    <template v-if="$scopedSlots.key"
                              #key="scope"
                    >
                        <slot name="key"
                              v-bind="{...scope, index: idx, items}"
                        />
                    </template>
                    <template v-if="$scopedSlots.extra"
                              #extra="scope"
                    >
                        <slot name="extra"
                              v-bind="scope"
                        />
                    </template>
                </p-definition>
            </tbody>
        </table>

        <template #loader>
            <slot name="loading" />
        </template>
    </p-data-loader>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import { every, get, range } from 'lodash';


import { getValueByPath } from '@/data-display/dynamic/helper';
import { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';
import PDefinition from '@/data-display/tables/definition-table/definition/PDefinition.vue';
import type { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';
import type {
    DefinitionTableProps, DefinitionData, DefinitionField,
} from '@/data-display/tables/definition-table/type';
import PDataLoader from '@/feedbacks/loading/data-loader/PDataLoader.vue';

const makeDefItems = (fields: DefinitionField[], data?: DefinitionData|DefinitionData[], disableCopy?: boolean): DefinitionProps[] => fields.map((field) => {
    const dataValue = get(data, field.name) ?? getValueByPath(data, field.name) ?? '';
    return {
        ...field,
        data: dataValue,
        copyValue: (disableCopy || field.disableCopy) ? undefined : dataValue,
    };
});


export default defineComponent({
    name: 'PDefinitionTable',
    components: {
        PDataLoader,
        PDefinition,
    },
    props: {
        fields: {
            type: Array as PropType<DefinitionField[]>,
            default: () => [],
        },
        data: {
            type: [Object, Array] as PropType<DefinitionData|DefinitionData[]>,
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
            type: String as PropType<DefinitionTableProps['styleType']>,
            default: DEFINITION_TABLE_STYLE_TYPE.primary,
        },
        block: {
            type: Boolean,
            default: false,
        },
        customKeyWidth: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            contextKey: Math.floor(Math.random() * Date.now()),
            isNoData: computed(() => every(state.items, (def) => {
                if (typeof def.data === 'boolean') return false;
                return !def.data;
            })),
            skeletons: computed(() => range(props.skeletonRows ?? 5)),
            items: computed(() => makeDefItems(props.fields, props.data, props.disableCopy)),
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

    &.p-data-loader > .data-loader-container > .loader-wrapper > .loader {
        max-height: 10rem;
    }

    table {
        @apply w-full;
        table-layout: fixed;
        td {
            line-height: 1.8;
            word-break: break-word;
            overflow-x: auto;
        }
    }
    .def-row {
        td {
            @apply bg-white;
        }

        td:first-child {
            margin-right: 0.125rem;
        }
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
            &:nth-child(2n+1) td {
                background-color: $stripe-bg-color;
            }
            td:first-child {
                border-color: $key-border-color;
            }
        }
    }

    &.primary {
        @mixin style-type theme('colors.white'), theme('colors.violet.100'), transparent, transparent;
    }
    &.white {
        @mixin style-type theme('colors.white'), theme('colors.white'), theme('colors.gray.300'), transparent;

        @apply border-gray-200;

        table {
            tr {
                @apply border-b;
                &:first-of-type {
                    @apply rounded-t-lg;
                }
            }
        }
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
