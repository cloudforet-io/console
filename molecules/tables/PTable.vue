<template>
    <div :class="responsiveClassObject" :style="responsiveStyle">
        <table
            class="p-table"
            :class="classObject"
            :style="tableStyle"
        >
            <thead :class="theadClassObject" :style="theadStyle">
                <slot name="head" />
            </thead>
            <tbody :class="tbodyClass" :style="tbodyStyle" :onselectstart="tbodyOnSelectStart? 'return true':'return false'">
                <!--            is="transition-group" name="table-row"-->
                <!--            @before-enter="beforRowEnter"-->
                <!--            @enter="rowEnter"-->
                <!--            @leave="rowLeave"-->
                <slot name="body" />
            </tbody>
            <tfoot :class="tfootClass" :style="tfootStyle">
                <slot name="foot" />
            </tfoot>
        </table>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, reactive, Ref,
} from '@vue/composition-api';
import { tableProps, TablePropsType } from '@/components/molecules/tables/PTable.toolset';

/**
 * TODO: Add custom width of each field
 */
export default defineComponent({
    name: 'PTable',
    props: tableProps,
    setup(props: TablePropsType, context) {
        const getStyle = (tableStyle?: string, bgStyle?: boolean): string[] => {
            // if (bgStyle && tableStyle) {
            //     return `bg-${tableStyle}`;
            // }
            const res: string[] = [];
            res.push(`table-${tableStyle || 'default'}`);
            if (bgStyle) {
                res.push(`bg-${tableStyle || 'white'}`);
            }
            return res;
        };

        const classObject: any = computed((): Array<object | string> => {
            let obj: Array<object | string> = [
                { 'table-sm': props.small },
                // { 'table-striped': props.striped },
                { 'table-hover': props.hover },
                { 'top-border': props.topBorder },
            ];
            if (props.bordered !== null) {
                obj.push({
                    'table-bordered': props.bordered,
                });
            }
            obj = [...obj, ...getStyle(props.tableStyleType, props.background)];
            return obj;
        });

        const theadClassObject: Readonly<Ref<Readonly<string[] | null>>> = computed((): string[] | null => {
            if (props.theadStyleType) {
                return [`thead-${props.theadStyleType}`];
            }
            return null;
        });

        const responsiveClassObject = computed((): string | null => {
            if (props.responsive) {
                if (props.responsive === true) {
                    return 'table-responsive';
                }
                return `table-responsive-${props.responsive}`;
            }
            return null;
        });
        const beforRowEnter = (el) => {
            el.style.opacity = 0;
            el.style.transform = 'translateY(30px)';
        };
        const rowEnter = (el, done) => {
            const delay = el.dataset.index * 100;
            const vm: any = getCurrentInstance();
            const handler = () => {
                vm.$velocity(el, { translateY: '0px', opacity: 1 },
                    {
                        duration: 100,
                        complete() {
                            done();
                        },
                    });
                done();
            };
            setTimeout(handler, delay);
        };
        const rowLeave = (el, done) => {
            el.style.opacity = 0;
            el.style.transform = 'translateY(30px)';
            done();
            // const delay = el.dataset.index * 100;
            // const vm = this;
            // setTimeout(() => {
            //     vm.$velocity(el, { translateY: '30px', opacity: 0 },
            //         {
            //             duration: 100,
            //             complete() {
            //                 done();
            //             },
            //         });
            //     done();
            // }, delay);
        };
        return {
            classObject,
            theadClassObject,
            responsiveClassObject,
            beforRowEnter,
            rowEnter,
            rowLeave,
        };
    },
});
</script>

<style lang="postcss">
    .p-table {
        @apply w-full max-w-full mb-4;
        border-collapse: separate;
        border-spacing: 0;
        th {
            position: sticky;
            z-index: 1;
            top: 0;
            line-height: 2;
            font-size: .875rem;
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
    }

    @define-mixin table-theme $th-bg-color, $stripe-bg-color, $border-color, $hover-color {
        th {
            background-color: $th-bg-color;
            height: 2rem;
        }
        &.top-border {
            th {
                border-top: 1px solid black;
                border-bottom: 1px solid black;
                position: relative;
            }
        }
        &.table-bordered {
            td {
                border-bottom: 1px solid $border-color;
            }
        }
        &.table-hover {
            tr:hover {
                background-color: $hover-color;
            }
        }
        &.table-striped {
            tr:nth-of-type(odd) {
                background-color: $stripe-bg-color;
            }
            tr:nth-of-type(even) {
                background-color: transparent;
            }
            &.table-hover {
                tr:hover {
                    background-color: $hover-color;
                }
            }
        }
    }

    .table-default {
        @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
    }
    .table-light {
         @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
         th {
             border-bottom: 1px solid theme('colors.gray.200');
         }
     }
    .table-primary4 {
        @mixin table-theme theme('colors.white'), transparent, theme('colors.white'), transparent;
        tr {
            @apply bg-primary4;
        }
        &.table-bordered {
            td {
                border-bottom-width: 4px;
            }
        }
    }

</style>
