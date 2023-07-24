import { notify } from '@kyvg/vue3-notification';

/** * @function
 *   @name showErrorMessage
 *   @param errorTitle
 *   @param error
 *   @returns
 */
export const showErrorMessage = (errorTitle, error) => {
    let errorMsg = '';
    if (error.message) errorMsg = error.message;
    else if (error.response) { errorMsg = error.response.data.error.message; } else { errorMsg = error; }
    notify({
        group: 'toastTopCenter',
        type: 'alert',
        title: errorTitle,
        text: errorMsg,
        duration: 5000,
        speed: 1000,
    });
};


/** * @function
 *   @name showSuccessMessage
 *   @param successTitle
 *   @param successMessage
 *   @returns
 */
export const showSuccessMessage = (successTitle, successMessage) => {
    notify({
        group: 'toastTopCenter',
        type: 'success',
        title: successTitle,
        text: successMessage,
        duration: 5000,
        speed: 500,
    });
};


/** * @function
 *   @name showLoadingMessage
 *   @param loadingTitle
 *   @param loadingMessage
 *   @returns
 */
export const showLoadingMessage = (loadingTitle, loadingMessage) => {
    notify({
        group: 'toastTopCenter',
        type: 'loading',
        title: loadingTitle,
        text: loadingMessage,
        duration: -1,
        speed: 500,
    });
};


/** * @function
 *   @name hideLoadingMessage
 *   @returns
 */
export const hideLoadingMessage = () => {
    notify({
        group: 'toastTopCenter',
        clean: true,
    });
};
