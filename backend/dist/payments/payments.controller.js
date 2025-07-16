"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
let PaymentsController = class PaymentsController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    postPaymentMethods() {
        return this.paymentService.postForPaymentMethods();
    }
    postPaymentsRedirect(requestBody) {
        return this.paymentService.postForPaymentsRedirect(requestBody);
    }
    postPaymentsNative(requestBody) {
        console.log("Received data:", requestBody.data);
        console.log("Received url:", requestBody.url);
        console.log("Received flow (from body):", requestBody.flow);
        return this.paymentService.postForPaymentsNative(requestBody);
    }
    postSessions(requestBody) {
        return this.paymentService.postForSessions(requestBody.data);
    }
    postPaymentDetails(requestBody) {
        return this.paymentService.postForPaymentDetails(requestBody.data);
    }
    postPaymentsAuthorisation(requestBody) {
        return this.paymentService.postPaymentsAuthorisation(requestBody);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)("/paymentMethods"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "postPaymentMethods", null);
__decorate([
    (0, common_1.Post)("/payments/redirect"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "postPaymentsRedirect", null);
__decorate([
    (0, common_1.Post)("/payments/native"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "postPaymentsNative", null);
__decorate([
    (0, common_1.Post)("/sessions"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "postSessions", null);
__decorate([
    (0, common_1.Post)("/paymentDetails"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "postPaymentDetails", null);
__decorate([
    (0, common_1.Post)("/paymentsAuthorisation"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "postPaymentsAuthorisation", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map