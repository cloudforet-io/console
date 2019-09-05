export const queryModel = {
    key: '',
    label: '',
    values: undefined || [''],
    type: undefined || '',
    ajax: undefined || { 
        url: '',
        method: '',
        filter: undefined || (() => { 
            return ''; 
        })
    }
};