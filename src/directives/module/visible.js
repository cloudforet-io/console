export default {

    binded (el, binding) {

    },
  // When elements are inserted into DOM
    inserted  (el, binding) {
        el.style.visibility = binding.value ? 'visible' : 'hidden';
    },
    componentUpdated (el, binding) {
        el.style.visibility = binding.value ? 'visible' : 'hidden';
    }

};
