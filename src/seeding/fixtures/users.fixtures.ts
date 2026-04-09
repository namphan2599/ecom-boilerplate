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

export const SEED_LOCAL_USERS: readonly SeedLocalUserFixture[] = [
  {
    id: 'admin-local',
    email: 'admin@aura.local',
    password: 'Admin123!',
    passwordHash:
      '$2b$10$XZaM2GqpX1aUDT3TXLHXWOWBiFyMIzKtCeQ3hwTCVoP5CcK9mkq06',
    role: AppRole.ADMIN,
    displayName: 'Aura Admin',
    firstName: 'Aura',
    lastName: 'Admin',
  },
  {
    id: 'customer-local',
    email: 'customer@aura.local',
    password: 'Customer123!',
    passwordHash:
      '$2b$10$MVvaBdr5CYjQOhBLyoEbFOwtNbwww.KOTLalzz46O3IMRqLRYTP52',
    role: AppRole.CUSTOMER,
    displayName: 'Aura Customer',
    firstName: 'Aura',
    lastName: 'Customer',
  },
] as const;
