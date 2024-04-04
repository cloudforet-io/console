export const downloadByFileUrl = async (downloadUrl:string): Promise<void> => {
    if (document) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_self';
        link.click();
        link.remove();
    }
};
