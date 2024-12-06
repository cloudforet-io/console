import type { Editor } from '@tiptap/vue-2';

import type { Attachment } from '@/common/components/editor/extensions/image/type';

// such as <p></p>
export const emptyHtmlRegExp = /<[^/>][^>]*><\/[^>]+>/;

export const getAttachments = <FileData>(editor: Editor, imgFileDataMap: Map<string, FileData>): Attachment<FileData>[] => {
    const contentsEl = editor.contentComponent?.$el;
    if (!contentsEl) return [];
    const imageElements = contentsEl.getElementsByTagName('img');
    return Array.from(imageElements)
        .reduce((results, imageElement) => {
            const fileId = imageElement.getAttribute('file-id');
            const downloadUrl = imageElement.getAttribute('src');
            if (fileId && downloadUrl) {
                results.push({ fileId, downloadUrl, data: imgFileDataMap.get(fileId) });
            }

            return results;
        }, [] as Attachment<FileData>[]);
};

export const setAttachmentsToContents = (contents: string, attachments: Attachment<any>[]): string => {
    if (attachments.length === 0) return contents;

    const contentsEl = document.createElement('div');
    contentsEl.innerHTML = contents.trim();

    const attachmentsMap = {};
    attachments.forEach(({ fileId, downloadUrl }) => {
        attachmentsMap[fileId] = downloadUrl;
    });

    const imageElements = contentsEl.getElementsByTagName('img');
    Array.from(imageElements)
        .forEach((imageElement) => {
            const fileId = imageElement.getAttribute('file-id');
            if (fileId && attachmentsMap[fileId]) {
                imageElement.setAttribute('src', attachmentsMap[fileId]);
            }
        });

    const newContents = contentsEl.innerHTML;
    contentsEl.remove();
    return newContents;
};
