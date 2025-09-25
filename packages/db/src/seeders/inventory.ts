import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";

import {
  address,
  location,
  organization,
  product,
  purchaseOrder,
  purchaseOrderLineItem,
  purchaseOrderShipment,
  purchaseOrderShipmentTrackingEvent,
  warehouse,
  warehouseProduct,
  warehouseProductTransaction,
} from "../schema";
import * as auth from "../schematics/auth-schema";
import * as inventory from "../schematics/inventory";
import * as locations from "../schematics/locations";
import { STATE_CODES_TO_NAMES } from "../utils/staticFields";

async function main() {
  const url = process.env.PRIMARY_DATABASE_URL ?? "";

  const db = drizzle({ connection: url, casing: "snake_case" });

  await reset(db, {});

  await reset(db, {
    address,
    location,
    organization,
    product,
    purchaseOrder,
    purchaseOrderLineItem,
    purchaseOrderShipment,
    purchaseOrderShipmentTrackingEvent,
    warehouse,
    warehouseProduct,
    warehouseProductTransaction,
  });

  await seed(db, {
    organization: auth.organization,
    location: locations.location,
    address: locations.address,
    product: inventory.product,
    purchaseOrder: inventory.purchaseOrder,
    purchaseOrderLineItem: inventory.purchaseOrderLineItem,
    purchaseOrderShipment: inventory.purchaseOrderShipment,
    purchaseOrderShipmentTrackingEvent:
      inventory.purchaseOrderShipmentTrackingEvent,
    warehouse: inventory.warehouse,
    warehouseProduct: inventory.warehouseProduct,
    warehouseProductTransaction: inventory.warehouseProductTransaction,
  }).refine((f) => ({
    organization: {
      columns: {
        id: f.uuid(),
        defaultSchedulingPolicyId: undefined,
      },
    },
    address: {
      columns: {
        line1: f.streetAddress(),
        line2: f.valuesFromArray({
          values: ["STE", "APT", "BLD"],
        }),
        line3: f.int({ minValue: 1, maxValue: 30 }),
        city: f.city(),
        state: f.state(),
        stateCode: f.valuesFromArray({
          values: Object.keys(STATE_CODES_TO_NAMES),
        }),
        zip: f.postcode(),
      },
    },
    location: {},
    warehouse: {
      columns: {
        shipTo: f.fullName(),
        accountId: f.uuid(),
        integrationType: f.valuesFromArray({
          values: ["shared", "solo", "chungus"],
        }),
      },
    },
    product: {},
    purchaseOrder: {
      columns: {
        parentPurchaseOrderId: f.int({
          minValue: 0,
          maxValue: 10,
          isUnique: true,
        }),
      },
    },
    purchaseOrderLineItem: {
      columns: {
        quantityOrdered: f.int({ minValue: 3, maxValue: 5 }),
        quantityReceived: f.int({ minValue: 0, maxValue: 3 }),
      },
    },
    purchaseOrderShipment: {},
    purchaseOrderShipmentTrackingEvent: {},
    warehouseProduct: {
      columns: {
        onHandQuantity: f.int({ minValue: 0, maxValue: 3 }),
        desiredQuantity: f.int({ minValue: 3, maxValue: 5 }),
      },
    },
    warehouseProductTransaction: {
      columns: {
        quantity: f.int({ minValue: -5, maxValue: 5 }),
      },
    },
  }));

  console.log("inventory seeded");
}

await main();
