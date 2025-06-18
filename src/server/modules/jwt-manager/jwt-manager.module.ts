import { Global, Module } from '@nestjs/common';
import { JwtManagerService } from './jwt-manager.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Global()
@Module({
    imports: [JwtModule.register({ secret: process.env.ACCESS_TOKEN_SECRET })],
    providers: [JwtManagerService, JwtService],
    exports: [JwtManagerService, JwtService]
})
export class JwtManagerModule {}
