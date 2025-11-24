import { v4 as uuidv4 } from "uuid";
import { DomainSearchResult, DomainPurchaseRequest, DomainPurchaseRecord, DomainStatus, DNSRecord } from "./types.js";
import { purchases, dnsRecords, domainStatus } from "./state.js";

export class DomainEngine {
  static search(domain: string): DomainSearchResult {
    const available = !purchases.some(p => p.domain === domain);
    return {
      domain,
      available,
      simulatedPrice: 14.99
    };
  }

  static purchase(req: DomainPurchaseRequest): DomainPurchaseRecord {
    const id = uuidv4();
    const record: DomainPurchaseRecord = {
      id,
      domain: req.domain,
      buyerId: req.buyerId,
      price: 14.99,
      purchasedAt: new Date().toISOString(),
      mode: "SIMULATED"
    };
    purchases.push(record);
    domainStatus.set(req.domain, {
      domain: req.domain,
      purchased: true,
      dnsConfigured: false,
      sslEnabled: false
    });
    return record;
  }

  static configureDNS(domain: string, records: DNSRecord[]): DomainStatus {
    dnsRecords.push(...records);
    const current = domainStatus.get(domain);
    if (!current) throw new Error("Domain not found");
    current.dnsConfigured = true;
    return current;
  }

  static enableSSL(domain: string): DomainStatus {
    const current = domainStatus.get(domain);
    if (!current) throw new Error("Domain not found");
    current.sslEnabled = true;
    return current;
  }

  static linkToStore(domain: string, storeId: string): DomainStatus {
    const current = domainStatus.get(domain);
    if (!current) throw new Error("Domain not found");
    current.linkedStoreId = storeId;
    return current;
  }

  static getStatus(domain: string): DomainStatus | undefined {
    return domainStatus.get(domain);
  }
}
