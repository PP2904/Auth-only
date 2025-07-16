import { PaymentsService } from "./payments.service";
export declare class PaymentsController {
    private paymentService;
    constructor(paymentService: PaymentsService);
    postPaymentMethods(): Promise<any>;
    postPaymentsRedirect(requestBody: any): Promise<any>;
    postPaymentsNative(requestBody: any): Promise<any>;
    postSessions(requestBody: any): Promise<any>;
    postPaymentDetails(requestBody: any): Promise<any>;
    postPaymentsAuthorisation(requestBody: any): Promise<any>;
}
