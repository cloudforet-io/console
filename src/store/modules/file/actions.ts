import type { Action } from 'vuex';

import axios from 'axios';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import type { ExcelDataField, FileState } from '@/store/modules/file/type';

import config from '@/lib/config';
import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface HeaderMessage {
    title: string;
}

export interface ExcelPayload {
    url: string;
    param: any;
    fields: ExcelDataField[];
    sheet_name?: string;
    header_message?: HeaderMessage;
    file_name_prefix?: string;
}

const getFileName = (contentDisposition) => {
    const fileName = contentDisposition
        .split(';')
        .filter((el) => el.indexOf('filename') > -1)
        .map((ele) => ele.replace(/"/g, '').split('=')[1]);
    return fileName[0];
};
export const downloadExcel: Action<FileState, any> = async ({ commit, rootState, dispatch }, payload: ExcelPayload[] | ExcelPayload): Promise<void> => {
    dispatch('display/startLoading', { loadingMessage: i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD') }, { root: true });
    try {
        let params;
        if (Array.isArray(payload)) {
            params = payload.map(({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                url, param, fields, sheet_name, file_name_prefix, header_message,
            }) => ({
                source: {
                    url,
                    param,
                },
                template: {
                    options: {
                        fileType: 'xlsx', // will be deprecated»
                        timezone: rootState.user.timezone,
                        sheet_name,
                        file_name_prefix,
                        header_message,
                    },
                    fields,
                },
            }));
        } else {
            params = {
                source: {
                    url: payload.url,
                    param: payload.param,
                },
                template: {
                    options: {
                        fileType: 'xlsx', // will be deprecated
                        timezone: rootState.user.timezone,
                        sheet_name: payload.sheet_name,
                        file_name_prefix: payload.file_name_prefix,
                        header_message: payload.header_message,
                    },
                    fields: payload.fields,
                },
            };
        }

        const res = await SpaceConnector.client.addOns.excel.export(params);

        if (typeof res === 'string') { // defensive code for case of unexpected response from the server. will be removed
            commit('setDownloadSource', config.get('CONSOLE_API.ENDPOINT') + res);
        } else {
            const { headers, data } = await axios.get(config.get('CONSOLE_API.ENDPOINT') + res.file_link, { responseType: 'blob' }).catch((e) => {
                /*
                Must manually call showErrorMessage().
                Because this error is not from the SpaceConnector(it's from axios), so the ErrorHandler does not pop up the error message in the catch below.
                */
                setTimeout(() => {
                    showErrorMessage(i18n.t('COMMON.EXCEL.ALT_E_DOWNLOAD'), e);
                }, 500);
                throw e;
            });
            const blob = new Blob([data], {
                type: headers['content-type'],
            });
            const name = decodeURIComponent(headers['content-disposition']);
            const fileName = getFileName(name);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.target = '_self';
            link.download = fileName;
            link.click();
            link.remove();
        }

        dispatch('display/finishLoading', { successMessage: i18n.t('COMMON.EXCEL.ALT_S_DOWNLOAD_SUCCESS') }, { root: true });
    } catch (error) {
        ErrorHandler.handleRequestError(error, i18n.t('COMMON.EXCEL.ALT_E_DOWNLOAD'));
        dispatch('display/finishLoading', {}, { root: true });
    }
};
