const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
export default {
    props: {
        styleType: {
            type: String,
            default: null,
            validator(value) {
                return [null, ...color].indexOf(value) !== -1;
            },
        },
        background: {
            type: String,
            default: null,
            validator(value) {
                return [null, ...color].indexOf(value) !== -1;
            },
        },
    },
    computed: {
        classObject() {
            if (this.styleType) {
                return [`table-${this.styleType}`];
            } if (this.background) {
                return [`table-${this.background}`];
            }
            return [];
        },
    },
};
