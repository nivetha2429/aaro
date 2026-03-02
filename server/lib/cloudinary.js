import { v2 as cloudinary } from 'cloudinary';

const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

/**
 * Upload a buffer to Cloudinary.
 * Returns the secure_url of the uploaded image.
 * Falls back gracefully if Cloudinary is not configured.
 */
export const uploadBuffer = (buffer, options = {}) => {
    if (!isConfigured) throw new Error('Cloudinary not configured');
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'aaro', resource_type: 'image', ...options },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

export { isConfigured };
export default cloudinary;
