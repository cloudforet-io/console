export default {

  bind (el, binding, vNode) {
    el.addEventListener('blur', binding.value)
  }

}
