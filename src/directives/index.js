import focus from './module/focus';

export default function (Vue) {
  // Register global custom directive
    Vue.directive('focus', focus);
}
