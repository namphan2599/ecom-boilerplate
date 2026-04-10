"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_LOCAL_USERS = void 0;
const role_enum_1 = require("../../common/auth/role.enum");
exports.SEED_LOCAL_USERS = [
    {
        id: 'admin-local',
        email: 'admin@aura.local',
        password: 'Admin123!',
        passwordHash: '$2b$10$XZaM2GqpX1aUDT3TXLHXWOWBiFyMIzKtCeQ3hwTCVoP5CcK9mkq06',
        role: role_enum_1.AppRole.ADMIN,
        displayName: 'Aura Admin',
        firstName: 'Aura',
        lastName: 'Admin',
    },
    {
        id: 'customer-local',
        email: 'customer@aura.local',
        password: 'Customer123!',
        passwordHash: '$2b$10$MVvaBdr5CYjQOhBLyoEbFOwtNbwww.KOTLalzz46O3IMRqLRYTP52',
        role: role_enum_1.AppRole.CUSTOMER,
        displayName: 'Aura Customer',
        firstName: 'Aura',
        lastName: 'Customer',
    },
];
//# sourceMappingURL=users.fixtures.js.map