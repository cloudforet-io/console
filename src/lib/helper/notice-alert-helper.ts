import Vue from 'vue';

/** * @function
 *   @name showErrorMessage
 *   @param error
 *   @param root
 *   @returns
 */
export const showErrorMessage = (errorTitle, error) => {
    let errorMsg = '';
    if (error.message) errorMsg = error.message;
    else if (error.response) { errorMsg = error.response.data.error.message; } else { errorMsg = error; }
    if (Vue) {
        (Vue as any).notify({
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
 *   @param root
 *   @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const showSuccessMessage = (successTitle, successMessage) => {
    if (Vue) {
        (Vue as any).notify({
            group: 'toastTopCenter',
            type: 'success',
            title: successTitle,
            text: successMessage,
            duration: 5000,
            speed: 500,
        });
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const showLoadingMessage = (loadingTitle, loadingMessage) => {
    if (Vue) {
        (Vue as any).notify({
            group: 'toastTopCenter',
            type: 'loading',
            title: loadingTitle,
            text: loadingMessage,
            duration: -1,
            speed: 500,
        });
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const hideLoadingMessage = (root?) => {
    if (Vue) {
        (Vue as any).notify({
            group: 'toastTopCenter',
            clean: true,
        });
    }
};
