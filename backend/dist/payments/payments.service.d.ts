import { ConfigService } from "@nestjs/config";
import { PaymentMethodsResponse, PaymentResponse, PaymentDetailsResponse, PaymentCompletionDetails, CreateCheckoutSessionResponse } from "@adyen/api-library/lib/src/typings/checkout/models";
export declare class PaymentsService {
    private configService;
    private API_KEY;
    private MERCHANT_ACCOUNT;
    private paymentsAPI;
    constructor(configService: ConfigService);
    postForPaymentMethods(): Promise<PaymentMethodsResponse>;
    postForPaymentsNative({ data, url }: {
        data: any;
        url: any;
    }): Promise<PaymentResponse>;
    postPaymentsAuthorisation({ data, url }: {
        data: any;
        url: any;
    }): Promise<PaymentResponse>;
    postForPaymentsRedirect({ data, url }: {
        data: any;
        url: any;
    }): Promise<PaymentResponse>;
    postForPaymentDetails({ details }: {
        details: PaymentCompletionDetails;
    }): Promise<PaymentDetailsResponse>;
    postForSessions({ url }: {
        url: any;
    }): Promise<CreateCheckoutSessionResponse>;
}
