import axios from 'axios';

import { downloadByFileUrl } from '@cloudforet/core-lib/file-download';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ExportResponse } from '@/models/export';
import { i18n } from '@/translations';

import config from '@/lib/config';
import type { ExcelPayload } from '@/lib/helper/file-download-helper/type';
import {
    hideLoadingMessage, showLoadingMessage, showErrorMessage, showSuccessMessage,
} from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';



const getFileName = (contentDisposition:string) => {
    const fileName = contentDisposition
        .split(';')
        .filter((el) => el.indexOf('filename') > -1)
        .map((ele) => ele.replace(/"/g, '').split('=')[1]);
    return fileName[0];
};

// This helper will be removed when all legacy excel download features are replaced with v2 export features.
export const downloadExcel = async (payload: ExcelPayload[] | ExcelPayload): Promise<void> => {
    const loadingMessageId = showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '');
    try {
        let params;
        if (Array.isArray(payload)) {
            params = payload.map(({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                url, param, data, fields, sheet_name, file_name_prefix, header_message, version, timezone,
            }) => ({
                source: {
                    url,
                    param,
                    data,
                },
                template: {
                    options: {
                        fileType: 'xlsx',
                        timezone,
                        sheet_name,
                        file_name_prefix,
                        header_message,
                    },
                    fields,
                },
                version,
            }));
        } else {
            params = {
                source: {
                    url: payload.url,
                    param: payload.param,
                    data: payload.data,
                },
                template: {
                    options: {
                        fileType: 'xlsx', // will be deprecated
                        timezone: payload.timezone,
                        sheet_name: payload.sheet_name,
                        file_name_prefix: payload.file_name_prefix,
                        header_message: payload.header_message,
                    },
                    fields: payload.fields,
                },
                version: payload.version,
            };
        }

        const res = await SpaceConnector.client.addOns.excel.export(params);

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

        hideLoadingMessage(loadingMessageId);
        setTimeout(() => {
            showSuccessMessage(i18n.t('COMMON.EXCEL.ALT_S_DOWNLOAD_SUCCESS'), '');
        }, 500);
    } catch (error) {
        ErrorHandler.handleRequestError(error, i18n.t('COMMON.EXCEL.ALT_E_DOWNLOAD'));
        hideLoadingMessage(loadingMessageId);
    }
};

// This helper helps the excel file download flow. Pass the export API as a callback function.
export const downloadExcelByExportFetcher = async (excelExportFetcher:() => Promise<ExportResponse>) => {
    const loadingMessageId = showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '');
    try {
        const exportResponse:ExportResponse = await excelExportFetcher();
        if (exportResponse) {
            await downloadByFileUrl(exportResponse.download_url);
            setTimeout(() => {
                showSuccessMessage(i18n.t('COMMON.EXCEL.ALT_S_DOWNLOAD_SUCCESS'), '');
            }, 500);
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.EXCEL.ALT_E_DOWNLOAD'));
    } finally {
        hideLoadingMessage(loadingMessageId);
    }
};
