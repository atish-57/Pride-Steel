import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Verify that all required environment variables are present
const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

// Configure cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            console.error('No file path provided to uploadOnCloudinary');
            return null;
        }
        
        // Add file existence check
        if (!fs.existsSync(filePath)) {
            console.error(`File does not exist at path: ${filePath}`);
            return null;
        }

        console.log(`Attempting to upload file: ${filePath}`);
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'uploads',
            resource_type: 'auto'
        });
        
        console.log('Successfully uploaded to Cloudinary:', result.url);
        
        // Remove the file from the local filesystem
        fs.unlinkSync(filePath);
        return result;
    } catch (error) {
        // More detailed error logging
        console.error('Error uploading to Cloudinary:', {
            error: error.message,
            filePath,
            stack: error.stack
        });
        
        // Only try to delete if file exists
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return null;
    }
};

const deleteFromCloudinary = async (imageUrl) => {
    try {
        // Extract the public ID from the image URL
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };