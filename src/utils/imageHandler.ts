/**
 * Process an image file: Read, Resize, Compress -> Base64
 * @param file The file from input
 * @param maxWidth Max width (default 800px)
 * @param quality JPEG quality 0-1 (default 0.7)
 */
export const processImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!file.type.match(/image.*/)) {
            reject(new Error("File is not an image"));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (readerEvent) => {
            const image = new Image();
            image.src = readerEvent.target?.result as string;

            image.onload = () => {
                const canvas = document.createElement('canvas');
                let width = image.width;
                let height = image.height;

                // Resize logic
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.drawImage(image, 0, 0, width, height);

                // Compress to JPEG Base64
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };

            image.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
};
