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
        name: f.default({ defaultValue: "SafeStreets" }),
        slug: f.default({ defaultValue: "safestreets" }),
        logo: f.default({
          defaultValue: [
            "https://scontent-den2-1.xx.fbcdn.net/v/t39.30808-6/300744613_404486001792431_5961725451854351647_n.png?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=cLeCdGh92zoQ7kNvwF-lpCe&_nc_oc=Admj2MkRDVUPSe4Sbro-oImuIszOZdQi-hsLCbFGh0eJgsp1W1F8SN2cpIiO9p1rh5E&_nc_zt=23&_nc_ht=scontent-den2-1.xx&_nc_gid=X3LdMJOIctvLhiUjOy0tLw&oh=00_AfYMTT_MW_sHZM4VdLJeOSNT4mHCTRC9AeWjzMHOHAqWHQ&oe=68DB82D4",
          ],
        }),
      },
      count: 1,
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
        county: f.valuesFromArray({
          values: Object.values(STATE_CODES_TO_NAMES).map((t) => t + " County"),
        }),
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
    product: {
      columns: {
        externalId: f.uuid(),
        name: f.valuesFromArray({
          values: ["camera", "doorbell", "sensor"],
        }),
      },
    },
    purchaseOrder: {
      columns: {
        parentPurchaseOrderId: f.int({
          minValue: 0,
          maxValue: 10,
          isUnique: true,
        }),
        type: f.valuesFromArray({
          values: ["system", "manual"],
        }),
        shippingMethod: f.valuesFromArray({
          values: ["UPS", "USPS", "FEDEX"],
        }),
      },
    },
    purchaseOrderLineItem: {
      columns: {
        quantityOrdered: f.int({ minValue: 3, maxValue: 5 }),
        quantityReceived: f.int({ minValue: 0, maxValue: 3 }),
      },
    },
    purchaseOrderShipment: {
      columns: {
        trackingNumber: f.uuid(),
        carrier: f.valuesFromArray({
          values: ["UPS", "USPS", "FEDEX"],
        }),
        lastCarrierMessage: f.valuesFromArray({
          values: [
            "Your order has been shipped",
            "There was an issue with your order, please reach out to continue shipment",
            "We have received your order and will be shipping within the next 24 hours",
          ],
        }),
      },
    },
    purchaseOrderShipmentTrackingEvent: {
      columns: {
        trackingEventMessage: f.valuesFromArray({
          values: [
            "Your order has been shipped",
            "There was an issue with your order, please reach out to continue shipment",
            "We have received your order and will be shipping within the next 24 hours",
          ],
        }),
      },
    },
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
