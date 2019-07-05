import visible from './modules/visible'
import transition from './modules/transition'

export default function (Vue) {
  // Register global custom directive
  Vue.directive('visible', visible)
  Vue.directive('transitionList', transition)
  Vue.directive('transition', transition)
}
