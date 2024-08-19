export interface ImageValue {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: 'image/jpg' | 'image/jpeg' | 'image/png';
    buffer: any; // bytes
    size: number;
}