export interface Attachment {
    downloadUrl: string;
    fileId: string;
}

export type ImageUploader = (image: File) => Promise<Attachment>;
