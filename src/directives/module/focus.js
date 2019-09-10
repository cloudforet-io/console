export default {
    inserted: function(el, binding) {
        if (binding.value) { 
            el.focus(); 
        } else { 
            el.blur();
        }
    },

    componentUpdated: function(el, binding) {
        console.log('focus directive value: ', binding.value);
        console.log('focus directive old value: ', binding.oldValue);
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
    }
};
