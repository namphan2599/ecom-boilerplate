import { Module } from '@nestjs/common';
import { StorageService } from './rustfs-storage.service';

@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
