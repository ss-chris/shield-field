import { and, eq } from "drizzle-orm";
import z from "zod";

import type { InsertCustomer, UpdateCustomer } from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { customer } from "@safestreets/db/schema";

import type { customerFilters, sfBilling } from "../schema/customer";
import type { contractProcessErrorResponse } from "../schema/salesforce";
import { env } from "../env";
import SalesforceService from "./salesforce";

const salesforceService = await SalesforceService.initConnection(
  env.SALESFORCE_STAGING_USERNAME,
  env.SALESFORCE_STAGING_PASSWORD,
);

class CustomerService {
  async listCustomers(filters: customerFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(customer.id, filters.id));
    }

    return db.query.customer.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getCustomer(id: number) {
    const [result] = await db
      .select()
      .from(customer)
      .where(eq(customer.id, id));

    if (!result) {
      throw new Error(`Customer with id ${id} not found`);
    }

    return result;
  }

  async createCustomer(c: InsertCustomer) {
    const [result] = await db.insert(customer).values(c).returning();
    return result;
  }

  async updateCustomer(c: UpdateCustomer, id: number) {
    const [result] = await db
      .update(customer)
      .set(c)
      .where(eq(customer.id, id))
      .returning();

    if (!result) {
      throw new Error(`Customer with id ${id} not found`);
    }

    return result;
  }

  async getBillingFromSf(accountId: string) {
    const paymentQuery = `
          SELECT
            Id,
            blng__Amount__c,
            blng__Status__c
          FROM blng__Payment__c
          WHERE blng__Account__c = '${accountId}'
        `;
    const paymentResult = await salesforceService.query(paymentQuery);
    const payments = paymentResult.records;

    const paymentMethodQuery = `
          SELECT
            Id,
            blng__Active__c,
            blng__PaymentType__c,
            blng__BankAccountName__c,
            blng__BankName__c,
            blng__CardExpirationMonth__c,
            blng__CardExpirationYear__c,
            blng__CardLastFour__c,
            blng__CardType__c,
            blng__Nameoncard__c
          FROM blng__PaymentMethod__c
          WHERE blng__Account__c = '${accountId}'
        `;
    const paymentMethodResult =
      await salesforceService.query(paymentMethodQuery);
    const paymentMethods = paymentMethodResult.records;

    const loanQuery = `
          SELECT
            Id,
            Status__c,
            Finance_Partner__c,
            Approval_Amount__c,
            APR__c,
            Term__c
          FROM Loan__c
          WHERE Account__c = '${accountId}'
        `;
    const loanResult = await salesforceService.query(loanQuery);
    const loans = loanResult.records;

    const paymentPlanQuery = `
          SELECT
            Id,
            Equipment_Order__c,
            Number_of_Payments__c,
            Plan_Amount__c
          FROM Payment_Plan__c
          WHERE Account__c = '${accountId}'
        `;
    const paymentPlanResult = await salesforceService.query(paymentPlanQuery);
    const paymentPlans = paymentPlanResult.records;

    return {
      payments: payments,
      paymentMethods: paymentMethods,
      loans: loans,
      paymentPlans: paymentPlans,
    };
  }

  async processPaymentInSF(payment: sfBilling) {
    // TODO: build process payment endpoint in SF

    const response = await fetch(
      `https://safestreets--staging.sandbox.my.salesforce.com/services/apexrest/Billing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payment),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error("SF request failed - " + error);
    }

    return response.json();
  }

  async processContractsInSF(accountId: string) {
    const response = await fetch(
      `https://safestreets--staging.sandbox.my.salesforce.com/services/apexrest/ContractRestService/${accountId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SALESFORCE_STAGING_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      const error: contractProcessErrorResponse = await response.json();
      throw new Error(
        "SF request failed - " + error.messages.map((m) => m.error).join(", "),
      );
    }

    return response.json();
  }
}

export default CustomerService;
