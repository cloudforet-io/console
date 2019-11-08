export default {
    inserted(el, binding) {
        if (binding.value) {
            el.focus();
        } else {
            el.blur();
        }
    },

    componentUpdated(el, binding) {
        if (binding.modifiers.lazy) {
            if (Boolean(binding.value) === Boolean(binding.oldValue)) {
                return;
            }
        }

        if (binding.value) {
            el.focus();
        } else {
            el.blur();
        }
    },
};
