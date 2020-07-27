<template>
    <div >
        <table
            class="p-table"
            :class="classObject"
        >
            <thead>
                <slot name="head" />
            </thead>
            <tbody>
                <slot name="body" />
            </tbody>
            <tfoot>
                <slot name="foot" />
            </tfoot>
        </table>
    </div>
</template>

<script lang="ts">
import {
    computed,
} from '@vue/composition-api';
import { tableProps, TablePropsType } from '@/components/molecules/tables/PTable.toolset';

/**
 * TODO: Add custom width of each field
 */
export default {
    name: 'PTable',
    props: tableProps,
    setup(props: TablePropsType, context) {
        const classObject: any = computed((): object => ({
            striped: props.striped,
            bordered: props.bordered,
            'no-hover': !props.hover,
            [props.tableStyleType as string]: true,
        }));

        return {
            classObject,
        };
    },
};
</script>

<style lang="postcss">
    @define-mixin table-theme $th-bg-color, $stripe-bg-color, $border-color, $hover-color {
        th {
            background-color: $th-bg-color;
            height: 2rem;
        }
        &.bordered {
            td {
                border-bottom: 1px solid $border-color;
            }
        }
        tr:not(.no-hover):hover {
            background-color: $hover-color;
        }
        &.striped {
            tr:nth-of-type(odd) {
                background-color: $stripe-bg-color;
            }
            tr:nth-of-type(even) {
                background-color: transparent;
            }
            tr:not(.no-hover):hover {
                background-color: $hover-color;
            }
        }
    }

    .p-table {
        @apply w-full max-w-full mb-4;
        border-collapse: separate;
        border-spacing: 0;
        th {
            position: sticky;
            z-index: 1;
            top: 0;
            line-height: 2;
            font-size: 0.875rem;
            text-align: left;
            letter-spacing: 0;
        }
        tr {
            td {
                @apply h-10 px-4 z-0 truncate align-middle min-w-28 text-sm leading-normal;
            }
            &:first-child {
                td {
                    @apply border-t-0;
                }
            }
        }

        /* themes */
        &.default {
            @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
        }

        &.light {
            @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
            th {
                border-bottom: 1px solid theme('colors.gray.200');
            }
        }

        &.primary4 {
            @mixin table-theme theme('colors.white'), transparent, theme('colors.white'), transparent;
            tr {
                @apply bg-primary4;
            }
            &.bordered {
                td {
                    border-bottom-width: 4px;
                }
            }
        }
    }
</style>
