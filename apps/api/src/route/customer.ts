import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import {
  insertCustomerSchema,
  updateCustomerSchema,
} from "@safestreets/db/schema";

import { customerFiltersInput, sfBillingInput } from "~/schema/customer";
import CustomerService from "~/service/customer";

const customerService = new CustomerService();

const customerRouter = new Hono()

  .get("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const customer = await customerService.getCustomer(Number(id));
      return c.json({ data: customer }, 200);
    } catch (error) {
      console.error("get customer failed ", error);
      return c.json({ error: "Unable to fetch Customer with id " + id }, 500);
    }
  })

  .get("/", zValidator("query", customerFiltersInput), async (c) => {
    const filters = c.req.valid("query");

    console.log(process.env.PRIMARY_DATABASE_URL);

    try {
      const customers = await customerService.listCustomers(filters);
      return c.json(
        {
          data: customers,
          limit: filters.limit,
          offset: filters.offset,
        },
        200,
      );
    } catch (error) {
      console.error("list customers failed ", error);
      return c.json({ error: "Unable to fetch Customers - " + error }, 500);
    }
  })

  .post("/", zValidator("json", insertCustomerSchema), async (c) => {
    const customer = c.req.valid("json");

    try {
      const result = await customerService.createCustomer(customer);
      return c.json({ data: result }, 200);
    } catch (error) {
      console.error("create customer failed", error);
      return c.json({ error: "Unable to create Customer: " + error }, 500);
    }
  })

  .patch("/:id", zValidator("json", updateCustomerSchema), async (c) => {
    const customerInput = c.req.valid("json");
    const id = c.req.param("id");

    try {
      const result = await customerService.updateCustomer(
        customerInput,
        Number(id),
      );

      return c.json({ data: result });
    } catch (error) {
      console.error("update customer failed ", error);
      return c.json({ error: "Unable to update Customer" }, 500);
    }
  })

  .get("/sf/billing/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const billing = await customerService.getBillingFromSf(id);
      return c.json({ data: billing }, 200);
    } catch (error) {
      console.error("get Billing failed ", error);
      return c.json({ error: "Unable to fetch billing" }, 500);
    }
  })

  .post("/sf/billing", zValidator("json", sfBillingInput), async (c) => {
    const billingInput = c.req.valid("json");

    try {
      const billing = await customerService.processPaymentInSF(billingInput);
      return c.json({ data: billing }, 200);
    } catch (error) {
      console.error("get Billing failed ", error);
      return c.json({ error: "Unable to fetch billing" }, 500);
    }
  })

  .post("/sf/contract/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const response = await customerService.processContractsInSF(id);
      return c.json({ data: response }, 200);
    } catch (error) {
      console.error("Unable to fetch billing - ", error);
      return c.json({ error: "Unable to fetch billing - " + error }, 500);
    }
  });

export default customerRouter;
