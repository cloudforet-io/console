export interface Attachment<Data = never> {
    downloadUrl: string;
    fileId: string;
    data?: Data;
}

export type ImageUploader<Data = never> = (image: File) => Promise<Attachment<Data>>;
