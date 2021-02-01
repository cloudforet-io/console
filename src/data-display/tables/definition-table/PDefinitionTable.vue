<template>
    <div class="p-definition-table">
        <slot v-if="!loading && isNoData" name="empty">
            <p-empty class="no-data">
                <span>{{ $t('COMPONENT.DEFINITION_TABLE.NO_DATA') }}</span>
            </p-empty>
        </slot>
        <table v-else-if="!isNoData">
            <tbody>
                <p-definition v-for="(bind, idx) in items" :key="`${contextKey}-${idx}`"
                              class="def-row" v-bind="bind" @copy="onCopy(bind, idx)"
                >
                    <template #default="scope">
                        <slot :name="`data-${bind.name}`" v-bind="{...scope, index: idx, items}" />
                        <slot :name="`data-${idx}`" v-bind="{...scope, index: idx, items}" />
                    </template>
                    <template #copy="scope">
                        <slot name="copy" v-bind="{...scope, index: idx, items}">
                            <slot :name="`copy-${bind.name}`" v-bind="{...scope, index: idx, items}" />
                            <slot :name="`copy-${idx}`" v-bind="{...scope, index: idx, items}" />
                        </slot>
                    </template>
                </p-definition>
            </tbody>
        </table>
        <slot v-if="loading" name="loading">
            <div class="loading-backdrop fade-in" />
            <p-lottie name="thin-spinner" :size="2.5"
                      :auto="true" class="loading"
            />
        </slot>
    </div>
</template>

<script lang="ts">
import { every, range, get } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    DefinitionTableProps, DefinitionData, DefinitionField,
} from '@/data-display/tables/definition-table/type';
import PDefinition from '@/data-display/tables/definition-table/definition/PDefinition.vue';
import PLottie from '@/foundation/lottie/PLottie.vue';
import PEmpty from '@/data-display/empty/PEmpty.vue';
import { DefinitionProps } from '@/data-display/tables/definition-table/definition/type';

const makeDefItems = (fields: DefinitionField[], data?: DefinitionData): DefinitionProps[] => fields.map(item => ({
    ...item,
    data: get(data, item.name, ''),
}));

export default {
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
    },
    setup(props: DefinitionTableProps, { emit }) {
        const state = reactive({
            contextKey: Math.floor(Math.random() * Date.now()),
            isNoData: computed(() => every(state.items, def => !def.data)),
            skeletons: computed(() => range(props.skeletonRows)),
            items: computed(() => makeDefItems(props.fields, props.data)),
        });

        watch([() => props.data, () => props.fields], () => {
            state.contextKey = Math.floor(Math.random() * Date.now());
        });

        return {
            ...toRefs(state),
            onCopy(bind, idx) {
                emit('copy', bind, idx);
                emit(`copy:${bind.name}`, bind, idx);
            },
        };
    },
};
</script>

<style lang="postcss">
.p-definition-table {
    @apply relative;
    min-height: 11.25rem;
    .no-data {
        min-height: 11.25rem;
    }
    table {
        @apply w-full;
        td {
            @apply border-white;
            line-height: 1.8;
        }
    }
    .def-row:nth-child(2n+1) {
        td {
            &:first-child {
                @apply border-r-2 border-white;
            }

            @apply bg-violet-100;
        }
    }
    .loading-backdrop {
        @apply absolute w-full h-full overflow-hidden;
        background-color: white;
        opacity: 0.5;
        top: 0;
        z-index: 1;
    }
    .loading {
        @apply absolute flex w-full h-full justify-center items-center;
        top: 0;
        max-height: 10rem;
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
}
</style>
