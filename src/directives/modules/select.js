
export default {

  bind (el) {
  },
  componentUpdated (el, binding) {
    if (binding.value.switch) {
      let start, end
      if (binding.value.text === undefined) {
        start = 0
        end = 0
      } else {
        start = el.value.indexOf(binding.value.text)
        end = start + binding.value.text.length
      }
      el.setSelectionRange(start, end)
    }
  }

}
