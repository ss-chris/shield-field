import type { Record } from "jsforce";
import z from "zod";

export interface contractProcessErrorResponse {
  messages: [
    {
      type: string;
      source: string;
      error: string;
      description: string;
    },
  ];
}

export type PricebookEntry = Record & {
  Product2Id: string;
};

export type OrderItem = Record & {
  Quantity: number;
  UnitPrice: number;
  OrderId: string;
  Product2Id: string;
  Installation_Status__c: string;
  Sold_By__c?: string | null;
  External_Id__c: string;
  PricebookEntryId: string;
};

export type SFOrder = Record & {
  AccountId: string;
  Pricebook2Id: string;
  Status: string;
  RecordTypeId: string;
  ExternalId__c: string;
  EffectiveDate?: string;
};

export type SFObjects = {
  Order: SFOrder;
  OrderItem: OrderItem;
};
