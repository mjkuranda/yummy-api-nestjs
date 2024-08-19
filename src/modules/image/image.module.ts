import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { JwtManagerService } from '../jwt-manager/jwt-manager.service';
import { JwtManagerModule } from '../jwt-manager/jwt-manager.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [JwtManagerModule, RedisModule],
    controllers: [ImageController],
    providers: [ImageService, JwtManagerService],
    exports: [JwtManagerService]
})
export class ImageModule {}