<template>
    <div :class="responsiveClassObject">
        <table
            class="table"
            :class="classObject"
        >
            <thead :class="theadClassObject">
                <slot name="head"></slot>
            </thead>
            <tbody :class="theadClassObject">
                <slot name="body"></slot>
            </tbody>
            <tfoot :class="theadClassObject">
                <slot name="foot"></slot>
            </tfoot>
        </table>
    </div>
</template>

<script>
const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
export default {
    name: 'p-table',
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

<style scoped>

</style>
