export default {

  // When elements are inserted into DOM
  inserted: function (el, binding) {
    el.style.visibility = binding.expression == 'true' ? 'visible' : 'hidden'
  }

}
