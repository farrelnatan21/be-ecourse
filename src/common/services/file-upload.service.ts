import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { unlink } from "fs/promises";
import { diskStorage } from "multer";
import { basename, extname, join, resolve } from "path";

interface FileUploadOptions {
    destination: string;
    allowedTypes?: RegExp;
    maxSize?: number;
    allowedTypesMessage?: string;
}

@Injectable()
export class FileUploadService {
    private readonly logger = new Logger(FileUploadService.name);

    static getMulterConfig(options: FileUploadOptions) {
        const {
            destination,
            allowedTypes = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i,
            maxSize = 1024 * 1024 * 5, // 5MB
            allowedTypesMessage = 'Only images are allowed (jpg, jpeg, png, gif, webp, svg, avif)',
        } = options;

        return {
            storage: diskStorage({
                destination,
                filename: (req, file, cb) => {
                    const uniqueSuffix
                        = Date.now()
                        + '-' +
                        Math.round(Math.random() * 1e9);
                    cb(
                        null,
                        file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
                    );
                },
            }),
            fileFilter: (
                _req: Request,
                file: Express.Multer.File,
                cb: (error: Error | null, acceptFile: boolean) => void,
            ) => {
                if (!file.originalname.match(allowedTypes)) {
                    return cb(new BadRequestException(allowedTypesMessage), false);
                }
                cb(null, true);
            }
        }
    }

    static getAvatarMulterConfig() {
        return this.getMulterConfig({
            destination: './uploads/avatars', // Tambahkan ./ untuk relative path
        });
    }

    getFileUrl(filename: string, subDir: string): string {
        return `/${subDir}/${filename}`;
    }

    getAvatarUrl(filename: string): string {
        return this.getFileUrl(filename, 'avatars');
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            await unlink(filePath);
            this.logger.log(`File deleted successfully: ${filePath}`);
        } catch (error) {
            this.logger.error(`Failed to delete file ${filePath}: ${error}`);
        }
    }

    async deleteFileByName(filename: string, uploadsDir: string): Promise<void> {
        try {
            const safeFilename = basename(filename);
            const resolvedUploadDir = resolve(uploadsDir);
            const filePath = join(resolvedUploadDir, safeFilename);
            const safePath = resolve(filePath);

            if (!safePath.startsWith(resolvedUploadDir)) {
                this.logger.error(`Attempted to delete file outside of uploads directory: ${safePath}`); // Perbaiki backticks
                return;
            }
            await unlink(safePath); // Gunakan safePath, bukan filePath
            this.logger.log(`File deleted successfully: ${safePath}`);
        } catch (error) {
            this.logger.error(`Failed to delete file ${filename}: ${error}`);
        }
    }

    async deleteAvatarByName(filename: string): Promise<void> {
        return this.deleteFileByName(filename, './uploads/avatars');
    }
}