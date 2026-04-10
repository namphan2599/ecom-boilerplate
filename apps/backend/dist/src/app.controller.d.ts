import { AppRole } from './common/auth/role.enum';
import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getAdminSummary(): {
        scope: AppRole;
        capabilities: string[];
    };
    getOrderHistoryContext(): {
        scope: string;
        resource: string;
    };
}
