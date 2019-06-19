export default {

  // When elements are inserted into DOM
  inserted: function (el, binding) {
    el.style.visibility = binding.value ? 'visible' : 'hidden'
  },
  componentUpdated (el, binding) {
    el.style.visibility = binding.value ? 'visible' : 'hidden'
  }

}
