export default {

  bind (el, binding, vNode) {
    el.addEventListener('focus', binding.value)
  }

}
