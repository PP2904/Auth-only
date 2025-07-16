"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const payments_module_1 = require("./payments/payments.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(payments_module_1.PaymentsModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get("PORT") || 3000;
    console.log("Backend is listening on port: " + port);
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map