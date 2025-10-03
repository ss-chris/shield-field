import "dotenv/config";

import type { QueryResult, SaveResult, Record as SFRecord } from "jsforce";
import type { BulkIngestBatchResult } from "jsforce/lib/api/bulk";
import * as jsforce from "jsforce";

import type { SFObjects } from "../schema/salesforce";
import { env } from "../env";
import { stripAttributes } from "../utils/salesforce";

export class SalesforceService {
  private readonly _connection: jsforce.Connection;

  private constructor(_connection: jsforce.Connection) {
    this._connection = _connection;
  }

  public static async initConnection(
    username: string,
    password: string,
  ): Promise<SalesforceService> {
    const connection = new jsforce.Connection({
      loginUrl:
        env.SALESFORCE_SANDBOX !== "true"
          ? "https://login.salesforce.com"
          : "https://test.salesforce.com",
      version: "64.0",
    });
    await connection.login(username, password);
    return new SalesforceService(connection);
  }

  public async query<ExpectedResult extends SFRecord>(
    queryString: string,
  ): Promise<QueryResult<ExpectedResult>> {
    this.verifyConnection();
    const results = this._connection.query(queryString).then((qr) => {
      qr.records.forEach((r) => stripAttributes(r));
      return qr;
    });
    return results as unknown as QueryResult<ExpectedResult>;
  }

  private verifyConnection() {
    if (!this._connection) {
      throw new Error("Salesforce connection is not initialized");
    }
  }

  public async upsertSObject<ExpectedObject extends keyof SFObjects>(
    sObjectName: ExpectedObject,
    externalIdField: keyof SFObjects[ExpectedObject],
    object: Partial<SFObjects[ExpectedObject]>,
  ): Promise<SaveResult> {
    this.verifyConnection();

    return await this._connection
      .sobject(sObjectName)
      .upsert(object, externalIdField as string);
  }

  public async upsertSObjects<ExpectedObject extends keyof SFObjects>(
    sObjectName: ExpectedObject,
    externalIdField: keyof SFObjects[ExpectedObject],
    objects: Partial<SFObjects[ExpectedObject]>[],
  ): Promise<BulkIngestBatchResult> {
    this.verifyConnection();

    this._connection.bulk.pollTimeout = 120000;
    return await this._connection.bulk.load(
      sObjectName,
      "upsert",
      { extIdField: externalIdField as string },
      objects,
    );
  }
}

export default SalesforceService;
