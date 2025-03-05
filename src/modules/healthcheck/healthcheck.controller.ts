import { Controller, Get, HttpCode, Options, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('health-check')
export class HealthcheckController {

    @Get()
    @HttpCode(200)
    public check() {
        return {
            message: 'Application is responding.'
        };
    }

    @Options()
    public handlePreflightOptionsCheck(@Res() res: Response): void {
        res.header('Access-Control-Allow-Origin', '*'); // Zezwalamy na dowolny origin
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.sendStatus(204);
    }
}