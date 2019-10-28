<template>
    <button type="button" :class="classObject" @click="onClick">
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: 'p-button',
    events: ['click'],
    props: {
        forceClass: {
            type: Array,
            default: null,
        },
        /** @type {string} */
        href: {
            type: String,
            default: null,
        },
        /** @type {boolean} */
        disabled: {
            type: Boolean,
            default: false,
        },
        /** @type {boolean} */
        outline: {
            type: Boolean,
            default: false,
        },
        /** @type {string} */
        styleType: {
            type: String,
            default: null,
            validator(value) {
                return [
                    null,
                    'primary',
                    'secondary',
                    'success',
                    'danger',
                    'warning',
                    'info',
                    'light',
                    'dark',
                ].indexOf(value) !== -1;
            },
        },
        /** @type {boolean} */
        link: {
            type: Boolean,
            default: false,
        },
        /** @type {boolean} */
        block: {
            type: Boolean,
            default: false,
        },
        /** @type {string} */
        size: {
            type: String,
            default: null,
            validator(value) {
                return [
                    null,
                    'sm',
                    'lg',
                ].indexOf(value) !== -1;
            },
        },
        /** @type {string} */
        shape: {
            type: String,
            default: null,
            validator(value) {
                return [
                    null,
                    'circle',
                ].indexOf(value) !== -1;
            },
        },
    },
    computed: {
        classObject() {
            if (!this.forceClass) {
                const obj = ['btn'];
                obj.push({
                    disabled: this.disabled,
                    'btn-block': this.block,
                });
                if (this.style_class != null) {
                    obj.push(this.style_class);
                }
                if (this.size) {
                    obj.push(`btn-${this.size}`);
                }
                return obj;
            }
            return this.forceClass;
        },
        style_class() {
            if (this.link) {
                return 'btn-link';
            } if (this.styleType) {
                let prefix = 'btn-';
                if (this.outline) {
                    prefix += 'outline-';
                }
                return prefix + this.styleType;
            }
            return null;
        },
    },
    methods: {
        onClick(event) {
            if (!this.disabled) {
                if (this.href != null && this.href.trim()) {
                    /**
                     * TODO: Change it to use Vue outer
                     * */
                    this.self.location.href = this.href;
                }
                /**
                 * button click event, only emit when disabled value is false
                 * @event click
                 * @type {MouseEvent}
                 */
                this.$emit('click', event);
            }
        },
    },
};
</script>

<style scoped>

</style>
