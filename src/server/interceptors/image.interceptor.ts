import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class ImageInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler): Observable<Express.Multer.File> | Promise<Observable<Express.Multer.File>> {
        const isTestEnvironment = process.env.NODE_ENV === 'test';
        const multerOptions = {
            storage: isTestEnvironment ? memoryStorage() : diskStorage({
                destination: './data/images/dishes',
                filename: (req, file, callback) => {
                    const uuid = crypto.randomUUID();
                    const fileExt = extname(file.originalname);
                    const filename = `${uuid}${fileExt}`;

                    callback(null, filename);
                },
            }),
        };

        const fileInterceptor = FileInterceptor('image', multerOptions);
        const interceptor = new fileInterceptor('image', multerOptions);

        return interceptor.intercept(context, next);
    }
}