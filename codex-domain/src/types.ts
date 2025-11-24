export interface DomainSearchResult {
  domain: string;
  available: boolean;
  simulatedPrice: number;
}

export interface DomainPurchaseRequest {
  domain: string;
  buyerId: string;
}

export interface DomainPurchaseRecord {
  id: string;
  domain: string;
  buyerId: string;
  price: number;
  purchasedAt: string;
  mode: "SIMULATED";
}

export interface DNSRecord {
  domain: string;
  type: string;
  value: string;
  ttl: number;
}

export interface DomainStatus {
  domain: string;
  purchased: boolean;
  dnsConfigured: boolean;
  sslEnabled: boolean;
  linkedStoreId?: string;
}
