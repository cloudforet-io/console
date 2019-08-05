import visible from './module/visible';

export default function (Vue) {
  // Register global custom directive
    Vue.directive('visible', visible);
}
