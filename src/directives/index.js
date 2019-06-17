import focus from './modules/focus'
import blur from './modules/blur'
import visible from './modules/visible'
import transition from './modules/transition'

export default function (Vue) {
  // Register global custom directive
  Vue.directive('focus', focus)
  Vue.directive('blur', blur)
  Vue.directive('visible', visible)
  Vue.directive('transitionList', transition)
  Vue.directive('transition', transition)
}
