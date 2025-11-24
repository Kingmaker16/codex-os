import { DomainPurchaseRecord, DomainStatus, DNSRecord } from "./types.js";

export const purchases: DomainPurchaseRecord[] = [];
export const dnsRecords: DNSRecord[] = [];
export const domainStatus: Map<string, DomainStatus> = new Map();
