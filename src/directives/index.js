import focus from './module/focus';
import width from './module/width';

export default function (Vue) {
  // Register global custom directive
    Vue.directive('focus', focus);
    Vue.directive('width', width);
}
