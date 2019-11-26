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
            <tbody :class="theadClassObject" :style="tbodyStyle">
                <slot name="body" />
            </tbody>
            <tfoot :class="theadClassObject" :style="tfootStyle">
                <slot name="foot" />
            </tfoot>
        </table>
    </div>
</template>

<script>
const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
export default {
    name: 'PTable',
    props: {
        tableStyleType: {
            type: String,
            default: null,
            validator(value) {
                return [null, ...color].indexOf(value) !== -1;
            },
        },
        theadStyleType: {
            type: String,
            default: null,
            validator(value) {
                return [null, 'light', 'dark'].indexOf(value) !== -1;
            },
        },
        responsiveStyle: {
            type: Object,
            default: null,
        },
        tableStyle: {
            type: Object,
            default: null,
        },
        theadStyle: {
            type: Object,
            default: null,
        },
        tbodyStyle: {
            type: Object,
            default: null,
        },
        tfootStyle: {
            type: Object,
            default: null,
        },
        striped: {
            type: Boolean,
            default: false,
        },
        bord: {
            type: Boolean,
            default: null,
        },
        hover: {
            type: Boolean,
            default: false,
        },
        small: {
            type: Boolean,
            default: false,
        },
        background: {
            type: Boolean,
            default: false,
        },
        responsive: {
            type: [String, Boolean],
            default: false,
            validator(value) {
                return [false, true, 'sm', 'md', 'lg', 'xl'].indexOf(value) !== -1;
            },
        },
    },
    computed: {
        classObject() {
            const obj = [
                { 'table-sm': !!this.small },
                { 'table-striped': !!this.striped },
                { 'table-hover': this.hover },
            ];
            if (this.bord !== null) {
                obj.push({
                    'table-bordered': this.bord,
                    'table-borderless': !this.bord,
                });
            }
            if (this.tableStyleType || this.background) {
                obj.push(this.getStyle(this.tableStyleType, this.background));
            }

            return obj;
        },
        theadClassObject() {
            if (this.theadStyleType) {
                return [`thead-${this.theadStyleType}`];
            }
            return null;
        },
        responsiveClassObject() {
            if (this.responsive) {
                if (this.responsive === true) {
                    return 'table-responsive';
                }
                return `table-responsive-${this.responsive}`;
            }
            return null;
        },
    },
    methods: {
        getStyle(tableStyle, bgStyle) {
            if (bgStyle && tableStyle) {
                return `bg-${tableStyle}`;
            } if (tableStyle) {
                return `table-${tableStyle}`;
            }
            return null;
        },
    },
};
</script>

<style lang="scss" scoped>
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
    .table{
        border-collapse: separate;
        border-spacing: 0;
        thead{
            tr{
                th{
                    position: sticky;
                    top: 0;
                    padding: .25rem 0 .25rem .75rem;
                    background-color: $gray3 ;
                    border-top: 1px solid $gray2;
                    border-bottom: 1px solid $gray2;
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
                    vertical-align: middle;
                }
            }
        }
    }

    .table-striped tbody tr:nth-of-type(odd) {
        @extend %striped-row;
        &:hover {
            @extend %striped-row;
        }
    }


</style>
