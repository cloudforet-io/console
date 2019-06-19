export default {

  componentUpdated (el, binding) {
    if (binding.value) el.select()
  }

}
