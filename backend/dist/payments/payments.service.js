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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const api_library_1 = require("@adyen/api-library");
const models_1 = require("@adyen/api-library/lib/src/typings/checkout/models");
let PaymentsService = class PaymentsService {
    constructor(configService) {
        this.configService = configService;
        this.API_KEY = this.configService.get("ADYEN_API_KEY");
        this.MERCHANT_ACCOUNT = this.configService.get("ADYEN_MERCHANT_ACCOUNT");
        const client = new api_library_1.Client({
            apiKey: this.API_KEY,
            environment: "TEST",
        });
        this.paymentsAPI = new api_library_1.CheckoutAPI(client).PaymentsApi;
    }
    async postForPaymentMethods() {
        console.log("postForPaymentMethods called");
        const postData = {
            merchantAccount: this.MERCHANT_ACCOUNT,
        };
        return await this.paymentsAPI.paymentMethods(postData);
    }
    async postForPaymentsNative({ data, url }) {
        console.log("postForPaymentsNative called");
        const reference = (0, uuid_1.v4)();
        const authenticationData = {
            threeDSRequestData: {
                challengeWindowSize: models_1.ThreeDSRequestData.ChallengeWindowSizeEnum._05,
                nativeThreeDS: models_1.ThreeDSRequestData.NativeThreeDSEnum.Preferred,
            },
            authenticationOnly: true,
        };
        const paymentRequestData = {
            ...data,
            reference,
            returnUrl: url,
            origin: url,
            merchantAccount: this.MERCHANT_ACCOUNT,
            authenticationData,
            shopperConversionId: `shopper123`,
            metaData: {
                testData: `1234`
            },
            amount: data.amount || { currency: "EUR", value: 500 },
            channel: data.channel || models_1.PaymentRequest.ChannelEnum.Web,
        };
        console.log("postForPaymentsNative called and the data: ", data);
        console.log("postForPaymentsNative called and the payload: ", paymentRequestData);
        return await this.paymentsAPI.payments(paymentRequestData);
    }
    async postPaymentsAuthorisation({ data, url }) {
        console.log("postPaymentsAuthorisation called");
        console.log("the data obj: ", data);
        const pspDetails = data.metaData.pspRefFromDetails;
        const reference = `AuthOnlyAuthorisation_${pspDetails}`;
        const paymentAuthorisationRequestData = {
            ...data,
            reference,
            returnUrl: url,
            origin: url,
            merchantAccount: this.MERCHANT_ACCOUNT,
            shopperConversionId: `shopper123`,
            metaData: {
                testData: `1234`
            },
            amount: data.amount || { currency: "EUR", value: 500 },
            channel: data.channel || models_1.PaymentRequest.ChannelEnum.Web,
        };
        return await this.paymentsAPI.payments(paymentAuthorisationRequestData);
    }
    async postForPaymentsRedirect({ data, url }) {
        console.log("postForPaymentsRedirect called");
        const reference = (0, uuid_1.v4)();
        const authenticationData = {
            threeDSRequestData: {
                challengeWindowSize: models_1.ThreeDSRequestData.ChallengeWindowSizeEnum._05,
                nativeThreeDS: models_1.ThreeDSRequestData.NativeThreeDSEnum.Preferred,
            },
            authenticationOnly: true,
        };
        const paymentRequestData = {
            ...data,
            reference,
            returnUrl: url,
            authenticationData,
            origin: url,
            merchantAccount: this.MERCHANT_ACCOUNT,
            amount: data.amount || { currency: "EUR", value: 1000 },
            channel: data.channel || models_1.PaymentRequest.ChannelEnum.Web,
        };
        return await this.paymentsAPI.payments(paymentRequestData);
    }
    async postForPaymentDetails({ details }) {
        console.log("postForPaymentDetails called");
        console.log("this are the details: ", details);
        return await this.paymentsAPI.paymentsDetails({ details });
    }
    async postForSessions({ url }) {
        const reference = (0, uuid_1.v4)();
        const sessionsRequestData = {
            amount: {
                currency: "EUR",
                value: 1000,
            },
            countryCode: "NL",
            shopperName: {
                firstName: "Test",
                lastName: "Shopper",
            },
            telephoneNumber: "0612345678",
            billingAddress: {
                houseNumberOrName: "1",
                street: "Shopper Billing Street",
                city: "Amsterdam",
                country: "NL",
                postalCode: "1234AB",
            },
            deliveryAddress: {
                houseNumberOrName: "1",
                street: "Shopper Delivery Street",
                city: "Amsterdam",
                country: "NL",
                postalCode: "1234AB",
            },
            shopperIP: "http://192.0.2.1/",
            shopperEmail: "test@adyen.com",
            channel: models_1.PaymentRequest.ChannelEnum.Web,
            reference: reference,
            returnUrl: url,
            merchantAccount: this.MERCHANT_ACCOUNT,
        };
        return await this.paymentsAPI.sessions(sessionsRequestData);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map