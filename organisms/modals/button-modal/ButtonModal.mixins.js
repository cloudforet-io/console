export const methodsMixin = {
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
