import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SeedingService } from './seeding.service';

@Module({
  imports: [PrismaModule],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
