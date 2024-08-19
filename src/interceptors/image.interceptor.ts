import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class ImageInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
        const multerOptions = {
            storage: diskStorage({
                destination: './data/images/meals',
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