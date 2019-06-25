/**
 * @description This is for input element's select() event control.
 *
 *              binding.value must be an object like below:
 *              { switch: {Boolean}, [text]: {String}, [index]: {Number} }
 */
const setSelection = (el, binding) => {
  if (!binding.value.switch) return

  let start, end
  if (binding.value.index !== undefined) start = end = binding.value.index
  else if (binding.value.text === undefined) {
    start = 0
    end = 0
  } else {
    start = el.value.indexOf(binding.value.text)
    end = start + binding.value.text.length
  }

  el.setSelectionRange(start, end)
}
export default {

  bind (el, binding) {
    if (binding.value.switch) setSelection(el, binding)
  },
  componentUpdated (el, binding) {
    setSelection(el, binding)
  }

}
