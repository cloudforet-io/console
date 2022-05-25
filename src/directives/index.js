import focus from './module/focus';

// eslint-disable-next-line @typescript-eslint/naming-convention,func-names
export default function (Vue) {
    // Register global custom directive
    Vue.directive('focus', focus);
}
