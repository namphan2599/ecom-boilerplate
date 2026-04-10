import { Strategy } from 'passport-jwt';
import { AppRole } from '../../common/auth/role.enum';
import { AuthenticatedUser } from '../auth.service';
interface JwtPayload {
    sub: string;
    email: string;
    role: AppRole;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): AuthenticatedUser;
}
export {};
