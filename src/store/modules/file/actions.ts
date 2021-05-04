import { ExcelDataField, FileState } from '@/store/modules/file/type';
import { SpaceConnector } from '@/lib/space-connector';
import { Action } from 'vuex';
import config from '@/lib/config';
import axios from 'axios';
import { store } from '@/store';

interface HeaderMessage {
    title: string;
}

interface ExcelPayload {
    url: string;
    param: any;
    fields: ExcelDataField[];
    // eslint-disable-next-line camelcase
    sheet_name?: string;
    // eslint-disable-next-line camelcase
    header_message?: HeaderMessage;
    // eslint-disable-next-line camelcase
    file_name_prefix?: string;
}

export const downloadExcel: Action<FileState, any> = async ({ commit, rootState }, payload: ExcelPayload[] | ExcelPayload): Promise<void> => {
    try {
        let params;
        if (Array.isArray(payload)) {
            params = payload.map(({
                // eslint-disable-next-line camelcase
                url, param, fields, sheet_name, file_name_prefix, header_message,
            }) => ({
                source: {
                    url,
                    param,
                },
                template: {
                    options: {
                        fileType: 'xlsx', // will be deprecated
                        timezone: rootState.user.timezone,
                        // eslint-disable-next-line camelcase
                        sheet_name,
                        // eslint-disable-next-line camelcase
                        file_name_prefix,
                        // eslint-disable-next-line camelcase
                        header_message,
                    },
                    data_source: fields, // will be deprecated
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
                        // eslint-disable-next-line camelcase
                        sheet_name: payload.sheet_name,
                        // eslint-disable-next-line camelcase
                        file_name_prefix: payload.file_name_prefix,
                        header_message: payload.header_message,
                    },
                    data_source: payload.fields, // will be deprecated
                    fields: payload.fields,
                },
            };
        }

        const res = await SpaceConnector.client.addOns.excel.export(params);

        const getFileName = (contentDisposition) => {
            const fileName = contentDisposition
                .split(';')
                .filter(el => el.indexOf('filename') > -1)
                .map(ele => ele.replace(/"/g, '').split('=')[1]);
            return fileName[0];
        };

        if (typeof res === 'string') { // defensive code for case of unexpected response from the server. will be removed
            commit('setDownloadSource', config.get('CONSOLE_API.ENDPOINT') + res);
        } else {
            store.dispatch('display/startDownloading');
            const { headers, data } = await axios.get(config.get('CONSOLE_API.ENDPOINT') + res.file_link, { responseType: 'blob' });
            store.dispatch('display/finishDownloading');
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

            // commit('setDownloadSource', link);
        }
    } catch (e) {
        console.error(e);
    }
};
