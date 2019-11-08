export default {
    props: {
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        onCloseClick() {
            this.$emit('close');
            this.hide();
        },
        onCancelClick() {
            this.$emit('cancel');
            if (this.hideOnCancel) {
                this.hide();
            }
        },
        onConfirmClick() {
            this.$emit('confirm');
        },
    },
};
