import Vue from 'vue';

import { getUUID } from '@/lib/component-util/getUUID';


/** * @function
 *   @name showErrorMessage
 *   @param errorTitle
 *   @param error
 *   @returns
 */
export const showErrorMessage = (errorTitle, error) => {
    let errorMsg = '';
    if (error.message) errorMsg = error.message;
    else if (error.response) { errorMsg = error.response.data.detail.message; } else { errorMsg = error; }
    if (Vue) {
        Vue.notify({
            group: 'toastTopCenter',
            type: 'alert',
            title: errorTitle,
            text: errorMsg,
            duration: 5000,
            speed: 1000,
        });
    }
};


/** * @function
 *   @name showSuccessMessage
 *   @param successTitle
 *   @param successMessage
 *   @returns
 */
export const showSuccessMessage = (successTitle, successMessage) => {
    if (Vue) {
        Vue.notify({
            group: 'toastTopCenter',
            type: 'success',
            title: successTitle,
            text: successMessage,
            duration: 5000,
            speed: 500,
        });
    }
};


/** * @function
 *   @name showLoadingMessage
 *   @param loadingTitle
 *   @param loadingMessage
 *   @parma id
 *   @param group
 *   @returns
 */
export const showLoadingMessage = (loadingTitle, loadingMessage, id?, group = 'toastTopCenter'):string|null => {
    if (Vue) {
        const uuid = getUUID();
        (Vue as any).notify({
            id: id ?? uuid,
            group,
            type: 'loading',
            title: loadingTitle,
            text: loadingMessage,
            duration: -1,
            speed: 500,
        });
        return uuid;
    }
    return null;
};


/** * @function
 *   @name hideLoadingMessage
 *   @param group
 *   @returns
 */
export const hideLoadingMessage = (id?:string, group = 'toastTopCenter') => {
    if (Vue) {
        if (id) (Vue.notify as any)?.close(id);
        else {
            Vue.notify({
                group,
                clean: true,
            });
        }
    }
};

export const showInfoMessage = (infoTitle, infoText) => {
    if (Vue) {
        Vue.notify({
            group: 'toastTopCenter',
            type: 'info',
            title: infoTitle,
            text: infoText,
            duration: 5000,
            speed: 1000,
        });
    }
};
