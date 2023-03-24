export interface Attachment {
    downloadUrl: string;
    fileId: string;
}

// eslint-disable-next-line no-unused-vars
export type ImageUploader = (image: File) => Promise<Attachment>;
