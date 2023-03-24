import { Plugin } from 'prosemirror-state';

import type { ImageUploader } from '@/common/components/editor/extensions/image/type';

export const dropImagePlugin = (upload: ImageUploader) => new Plugin({
    props: {
        handleDOMEvents: {
            paste: (view, _event: Event) => {
                // event param must be Event type. don't change it to ClipboardEvent type.
                const event = _event as ClipboardEvent;
                const items = Array.from(event.clipboardData?.items || []);
                const { schema } = view.state;

                items.forEach((item) => {
                    const image = item.getAsFile();

                    if (item.type.indexOf('image') === 0) {
                        event.preventDefault();

                        if (upload && image) {
                            upload(image).then(({ downloadUrl, fileId }) => {
                                const node = schema.nodes.image.create({
                                    src: downloadUrl,
                                    'file-id': fileId,
                                });
                                const transaction = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(transaction);
                            });
                        }
                    } else {
                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                            const node = schema.nodes.image.create({
                                src: readerEvent.target?.result,
                            });
                            const transaction = view.state.tr.replaceSelectionWith(node);
                            view.dispatch(transaction);
                        };
                        if (!image) return;
                        reader.readAsDataURL(image);
                    }
                });

                return false;
            },
            drop: (view, _event: Event) => {
                // event param must be Event type. don't change it to DragEvent type.
                const event = _event as DragEvent;
                const hasFiles = !!event.dataTransfer?.files?.length;

                if (!hasFiles) return false;

                const images = Array.from(
                    event.dataTransfer?.files ?? [],
                ).filter((file) => /image/i.test(file.type));

                if (images.length === 0) return false;

                event.preventDefault();

                const { schema } = view.state;
                const coordinates = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                });
                if (!coordinates) return false;

                images.forEach(async (image) => {
                    const reader = new FileReader();

                    if (upload) {
                        const { downloadUrl, fileId } = await upload(image);
                        const node = schema.nodes.image.create({
                            src: downloadUrl,
                            'file-id': fileId,
                        });
                        const transaction = view.state.tr.insert(coordinates.pos, node);
                        view.dispatch(transaction);
                    } else {
                        reader.onload = (readerEvent) => {
                            const node = schema.nodes.image.create({
                                src: readerEvent.target?.result,
                            });
                            const transaction = view.state.tr.insert(coordinates.pos, node);
                            view.dispatch(transaction);
                        };
                        reader.readAsDataURL(image);
                    }
                });

                return true;
            },
        },
    },
});
