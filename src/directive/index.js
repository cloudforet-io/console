import visible from './module/visible'
import transition from './module/transition'

export default function (Vue) {
  // Register global custom directive
  Vue.directive('visible', visible)
  Vue.directive('transitionList', transition)
  Vue.directive('transition', transition)
}
