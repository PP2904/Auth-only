// components.js

import AdyenCheckout from "@adyen/adyen-web";
import "@adyen/adyen-web/dist/adyen.css";

import {
  getPaymentMethods,
  postDoPayment,
  postDoPaymentDetails,
  postDoPaymentAuthorisation
} from "../../shared/payments";

import {
  renderResultTemplate,
  attachClickHandlerForReset,
  parseRedirectResultToRequestData,
  getFlowType
} from "../../shared/utils";

const CLIENT_KEY = import.meta.env.ADYEN_CLIENT_KEY;

// Declare as `let` so it can be reassigned later on radio button change
let flow = getFlowType(); // "native" or "redirect"

// ✅ Track changes to radio buttons
document.addEventListener("DOMContentLoaded", () => {
  const flowRadios = document.querySelectorAll('input[name="flow"]');
  flowRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      const selectedFlow = document.querySelector('input[name="flow"]:checked').value;
      flow = selectedFlow;
      console.log("Updated flow type:", flow);
    });
  });
});

let paymentMethodDetailsPaymentsAuth = null;
let globalBrowserInfo;
let paymentDetailsResponseGlobal = null;

const componentsInit = async () => {
  console.log("init of components advanced flow.");
  const url = window.location.href;

  if (url.includes("redirectResult")) {
    console.log("redirectResult in the url");
    const requestData = parseRedirectResultToRequestData(url);
    console.log("this is the requestData for redirect flow: ", requestData);

    const paymentDetailsResponse = await postDoPaymentDetails(requestData);
    console.log("/payments/details response:", paymentDetailsResponse);
    console.log("Auth-only response for redirect is here: ", paymentDetailsResponse.additionalData);

    renderResultTemplate(paymentDetailsResponse.resultCode);
  } else {
    const paymentMethods = await getPaymentMethods();
    console.log("paymentMethods response:", paymentMethods);

    const onSubmit = async (state, component) => {
      console.log("component on submit event", state, component);

      if (state.isValid) {
        console.log("this is the state.data for /payments call: ", state.data);

        paymentMethodDetailsPaymentsAuth = state.data.paymentMethod;
        globalBrowserInfo = state.data.browserInfo;

        const requestDataPayments = {
          paymentMethod: {
            ...state.data.paymentMethod,
            holderName: "Hans Wurst"
          },
          browserInfo: state.data.browserInfo,
          billingAddress: state.data.billingAddress,
          deliveryAddress: state.data.deliveryAddress,
          shopperName: state.data.shopperName,
          shopperIP: state.data.shopperIP,
          amount: {
            currency: "EUR",
            value: 1000 // This is for the initial /payments call, you might want to make this dynamic too
          },
          authenticationData: {
            //not needed here
            //authenticationOnly: true,
            threeDSRequestData: {
              nativeThreeDS: "preferred"
            }
          },
          shopperConversionId: `shopper123`,
          metaData: {
            testData: `1234`
          }
        };

        console.log("this is the requestData for /payments call: ", requestDataPayments);

        const paymentResponse = await postDoPayment(requestDataPayments, { url, flow });

        if (paymentResponse.resultCode === "Authorised") {
          console.log(`response is ${paymentResponse.resultCode}, unmounting component and rendering result`);
          renderResultTemplate(paymentResponse.resultCode);
        } else if (paymentResponse.resultCode === "AuthenticationNotRequired") {
          console.log("Authentication is not required, proceeding directly to authorisation.");
          console.log("response pspReference: ", paymentResponse.pspReference);

          // Store necessary data for authorisation
          paymentDetailsResponseGlobal = {
            pspReference: paymentResponse.pspReference,
            additionalData: {}
          };
          // IMPORTANT: Do NOT store paymentData here. It is not provided in this response.

          // Unmount the Adyen component and display the authorization UI
          component.unmount();
          renderResultTemplate(paymentResponse.resultCode);
          
        } else { // This is for all other action types (e.g., redirect, 3ds2fingerprint)
          const paymentData = paymentResponse.action?.paymentData;
          console.log("Stored paymentDataPaymentsAuth:", paymentData);
          localStorage.setItem("paymentDataPaymentsAuth", JSON.stringify(paymentData));
          console.log("paymentResponse includes an action, passing action to component.handleAction function.");
          component.handleAction(paymentResponse.action);
        }
      }
    };

    const onAdditionalDetails = async (state, component) => {
      console.log("onadditionaldetails event", state);

      const requestDataPaymentsDetails = {
        ...state.data
      };

      const paymentDetailsResponse = await postDoPaymentDetails(requestDataPaymentsDetails);
      console.log("requestData for payments/details: ", requestDataPaymentsDetails);
      console.log("payments details response:", paymentDetailsResponse);

      if (paymentDetailsResponse.action) {
          // If the response has another action, handle it
          component.handleAction(paymentDetailsResponse.action);
      } else {
          // If there's no action, the flow is complete
          renderResultTemplate(paymentDetailsResponse.resultCode);
          paymentDetailsResponseGlobal = paymentDetailsResponse;
          console.log("this is paymentDetailsResponseGlobal: ", paymentDetailsResponseGlobal);
          component.unmount();
      }
    };

    const checkoutConfig = {
      paymentMethodsResponse: paymentMethods,
      locale: "en_US",
      environment: "test",
      clientKey: CLIENT_KEY,
      analytics: { enabled: false },
      onSubmit: onSubmit,
      onAdditionalDetails: onAdditionalDetails,
      showPayButton: true
    };

    const checkout = await AdyenCheckout(checkoutConfig);
    console.log("created checkout instance with config:", checkoutConfig);

    checkout.create("card").mount("#component-container");
    console.log("created and mounted card component to #component-container");
  }
};

// authorisation request
export async function paymentAuthorisationResponse() {
  const url = window.location.href;

  if (!paymentDetailsResponseGlobal || !paymentMethodDetailsPaymentsAuth) {
    console.error("Missing required authentication data. Cannot proceed with authorisation.");
    return;
  }

  const paymentDataFromStorage = localStorage.getItem("paymentDataPaymentsAuth");
  const paymentData = paymentDataFromStorage ? JSON.parse(paymentDataFromStorage) : null;

  if (!paymentData && !paymentDetailsResponseGlobal.pspReference) {
    console.error("No paymentData or pspReference found. Aborting authorisation.");
    return;
  }

  const amountInput = document.getElementById("authorisationAmount");
  let userEnteredAmount = 500; // Default fallback amount

  if (amountInput && amountInput.value) {
    const parsedAmount = parseInt(amountInput.value, 10);
    if (!isNaN(parsedAmount) && parsedAmount >= 0) {
      userEnteredAmount = parsedAmount;
    } else {
      console.warn("Invalid amount entered, using default of 500.");
    }
  } else {
    console.warn("Authorisation amount input not found or empty, using default of 500.");
  }

  // Create the base request object
  const requestDataPaymentsAuthorisation = {
    amount: {
      currency: "EUR",
      value: userEnteredAmount
    },
    channel: "Web",
    reference: "Auth-only_Authorisation_Test",
    shopperInteraction: "Ecommerce",
    recurringProcessingModel: "CardOnFile",
    mpiData: {
      authenticationResponse: paymentDetailsResponseGlobal.additionalData?.threeDAuthenticatedResponse,
      directoryResponse: paymentDetailsResponseGlobal.additionalData?.['threeds2.threeDS2Result.transStatus'],
      cavv: paymentDetailsResponseGlobal.additionalData?.cavv,
      eci: paymentDetailsResponseGlobal.additionalData?.['threeds2.threeDS2Result.eci'],
      threeDSVersion: paymentDetailsResponseGlobal.additionalData?.threeDSVersion,
    },
    dsTransID: paymentDetailsResponseGlobal.additionalData?.['threeds2.threeDS2Result.dsTransID'],
    metaData: {
      pspRefFromDetails: paymentDetailsResponseGlobal.pspReference
    },
    paymentMethod: paymentMethodDetailsPaymentsAuth,
    browserInfo: globalBrowserInfo
  };

  // Conditionally add paymentData only if it exists
  if (paymentData) {
    requestDataPaymentsAuthorisation.paymentData = paymentData;
  }

  console.log("requestData for payments (Authorisation): ", requestDataPaymentsAuthorisation);

  const paymentAuthorisationResponse = await postDoPaymentAuthorisation(
    requestDataPaymentsAuthorisation,
    { url, flow }
  );

  renderResultTemplate(paymentAuthorisationResponse.resultCode);
  console.log("payments Authorisation response: ", paymentAuthorisationResponse);

  localStorage.removeItem("paymentDataPaymentsAuth");
}

document.addEventListener("DOMContentLoaded", () => {
  const authoriseBtn = document.getElementById("authorise-btn");
  const authMsg = document.querySelector(".auth-result-msg");
  const amountInputContainer = document.querySelector('.input-group');

  if (authoriseBtn) {
    authoriseBtn.style.display = "none";
  }
  if (amountInputContainer) {
    amountInputContainer.style.display = "none";
  }

  if (authoriseBtn) {
    authoriseBtn.addEventListener("click", () => {
      console.log("Authorisation button clicked");
      paymentAuthorisationResponse();
    });
  }

  if (authMsg && authoriseBtn && amountInputContainer) {
    const observer = new MutationObserver(() => {
      const currentText = authMsg.textContent.trim();
      if (currentText === "AuthenticationFinished" || currentText === "AuthenticationNotRequired") {
        authoriseBtn.style.display = "inline-block";
        amountInputContainer.style.display = "block";
      } else {
        authoriseBtn.style.display = "none";
        amountInputContainer.style.display = "none";
      }
    });
    observer.observe(authMsg, { childList: true, subtree: true });
  }
});

attachClickHandlerForReset();
componentsInit();