import { PrismaService } from '../prisma/prisma.service';
import { type SeedProfileLike } from './fixtures/catalog.fixtures';
export type SeedProfile = SeedProfileLike;
export interface SeedRunStat {
    created: number;
    updated: number;
}
export interface SeedSummary {
    profile: SeedProfile;
    users: SeedRunStat;
    authIdentities: SeedRunStat;
    categories: SeedRunStat;
    tags: SeedRunStat;
    products: SeedRunStat;
    variants: SeedRunStat;
    prices: SeedRunStat;
    coupons: SeedRunStat;
}
export declare class SeedingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    seed(profileInput?: string): Promise<SeedSummary>;
    seedUsers(summary: SeedSummary): Promise<void>;
    seedCatalog(summary: SeedSummary, profile: SeedProfile): Promise<void>;
    seedCoupons(summary: SeedSummary, profile: SeedProfile): Promise<void>;
    private seedProduct;
    private createEmptySummary;
    private createRunStat;
    private bump;
    private assertSafeToSeed;
    private resolveProfile;
    private mapRole;
    private uniqueBy;
}
