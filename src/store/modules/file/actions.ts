import { ExcelDataField, FileState } from '@/store/modules/file/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { Action } from 'vuex';
import config from '@/lib/config';
import axios from 'axios';

interface HeaderMessage {
    title: string;
}

interface ExcelPayload {
    url: string;
    param: any;
    fields: ExcelDataField[];
    sheet_name?: string;
    header_message?: HeaderMessage;
    file_name_prefix?: string;
}

export const downloadExcel: Action<FileState, any> = async ({ commit, rootState, dispatch }, payload: ExcelPayload[] | ExcelPayload): Promise<void> => {
    try {
        let params;
        if (Array.isArray(payload)) {
            params = payload.map(({
                // eslint-disable-next-line @typescript-eslint/camelcase
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
                        // eslint-disable-next-line camelcase
                        sheet_name,
                        // eslint-disable-next-line camelcase
                        file_name_prefix,
                        // eslint-disable-next-line camelcase
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
                        // eslint-disable-next-line camelcase
                        sheet_name: payload.sheet_name,
                        // eslint-disable-next-line camelcase
                        file_name_prefix: payload.file_name_prefix,
                        header_message: payload.header_message,
                    },
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
            dispatch('display/startDownloading', {}, { root: true });
            const { headers, data } = await axios.get(config.get('CONSOLE_API.ENDPOINT') + res.file_link, { responseType: 'blob' });
            dispatch('display/finishDownloading', {}, { root: true });
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
