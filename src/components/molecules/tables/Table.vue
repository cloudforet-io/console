<template>
    <div :class="responsiveClassObject" :style="responsiveStyle">
        <table
            class="table"
            :class="classObject"
            :style="tableStyle"
        >
            <thead :class="theadClassObject" :style="theadStyle">
                <slot name="head" />
            </thead>
            <tbody :class="tbodyClass" :style="tbodyStyle">
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
import {computed, defineComponent, getCurrentInstance, reactive, Ref} from '@vue/composition-api';
import {tableProps, TablePropsType} from './toolset';

export default defineComponent( {
    name: 'PTable',
    props: tableProps,
    setup: function (props: TablePropsType, context) {
        const getStyle = (tableStyle: object | unknown, bgStyle: object | unknown): string | null => {
            if (bgStyle && tableStyle) {
                return `bg-${tableStyle}`;
            }
            if (tableStyle) {
                return `table-${tableStyle}`;
            }
            if (bgStyle) {
                return 'table-background';
            }
            return null;
        };
        const classObject = computed(() => {
            const obj: Array<object | string> = [
                {'table-sm': props.small},
                {'table-striped': props.striped},
                {'table-hover': props.hover},
            ];
            if (props.bord !== null) {
                obj.push({
                    'table-bordered': props.bord,
                    'table-borderless': !props.bord,
                });
            }
            if (props.tableStyleType || props.background) {
                obj.push(<string>getStyle(props.tableStyleType, props.background));
            }
            return obj;
        });
        const theadClassObject:Readonly<Ref<Readonly<string[] | null>>> = computed(():string[] | null=>{
            if (props.theadStyleType){
                return [`thead-${props.theadStyleType}`];
            }
            return null
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
        const beforRowEnter = (el)=> {
            el.style.opacity = 0;
            el.style.transform = 'translateY(30px)';
        };
        const rowEnter = (el, done)=> {
            const delay = el.dataset.index * 100;
            const vm:any = getCurrentInstance();
            const handler = ()=>{
                vm.$velocity(el, { translateY: '0px', opacity: 1 },
                    {
                        duration: 100,
                        complete() {
                            done();
                        },
                    });
                done();
            }
            setTimeout(handler, delay);
        };
        const rowLeave = (el, done)=> {
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

<style lang="scss">
    %row {
        background-color: $white;
    }
    %hover{
        background-color: $secondary2;
    }
    %striped-row {
        background-color: $primary4;
    }
    %striped-hovered-row {
        background-color: $secondary2;
    }
    .table-background{
             background-color: white;
    }
    .table{
        border-collapse: separate;
        border-spacing: 0;
        thead{
            tr{
                th{
                    position: sticky;
                    z-index: 1;
                    top: 0;
                    padding: .25rem 0 .25rem .75rem;
                    background-color: $white;
                    border-top: 1px solid $dark;
                    border-bottom: 1px solid $dark;
                    line-height: 1.5rem;
                    text-align: left;
                    letter-spacing: 0;
                    color: $gray1;
                }
            }
        }
        &.table-hover{
            tbody tr:hover {
                @extend %hover
            }
        }
        tbody{
            tr{
                @extend %row;
                td{
                    z-index: 0;
                    vertical-align: middle;
                }
                &:first-child{
                    td{
                        border-top: 0;
                    }
                }
            }
        }
    }

    .table-striped tbody tr:nth-of-type(odd) {
        background-color: transparent;
    }
    .table-striped tbody tr:nth-of-type(even) {
        @extend %striped-row;
        &:hover {
            @extend %hover;
        }
    }

</style>
