import { AppRole } from '../../common/auth/role.enum';
export interface SeedLocalUserFixture {
    id: string;
    email: string;
    password: string;
    passwordHash: string;
    role: AppRole;
    displayName: string;
    firstName: string;
    lastName?: string;
}
export declare const SEED_LOCAL_USERS: readonly SeedLocalUserFixture[];
