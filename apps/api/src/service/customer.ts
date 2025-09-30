import { and, eq } from "drizzle-orm";

import type { InsertCustomer, UpdateCustomer } from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import { customer } from "@safestreets/db/schema";

import type { customerFilters, sfBilling } from "~/schema/customer";

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
    return;
    // TODO: either build sf service and login for SOQL query or setup kafka and billing object
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
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error("SF request failed - " + error);
    }

    return response.json();
  }
}

export default CustomerService;
