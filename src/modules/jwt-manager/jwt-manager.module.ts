import { Module } from '@nestjs/common';
import { JwtManagerService } from './jwt-manager.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
    imports: [JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET })],
    providers: [JwtManagerService, JwtService],
    exports: [JwtManagerService, JwtService]
})
export class JwtManagerModule {}
