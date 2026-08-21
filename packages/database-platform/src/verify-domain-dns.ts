import { promises as dns } from "node:dns";
import { platformPrisma } from "./index";

export type DnsVerifyResult = {
  verified: boolean;
  method?: "cname" | "txt";
  error?: string;
};

export async function verifyCustomDomainDns(
  operatorId: string,
  hostname: string,
): Promise<DnsVerifyResult> {
  const cnameTarget =
    process.env.CUSTOM_DOMAIN_CNAME_TARGET ?? "ingress.kenji-raffle.local";
  const txtRecordName = `_kenji-verify.${operatorId.slice(0, 8)}`;
  const expectedTxt = `kenji-verify=${operatorId}`;

  try {
    const cnames = await dns.resolveCname(hostname);
    const cnameOk = cnames.some(
      (c) =>
        c === cnameTarget ||
        c.endsWith(`.${cnameTarget}`) ||
        cnameTarget.endsWith(c),
    );
    if (cnameOk) {
      return { verified: true, method: "cname" };
    }
  } catch {
    // CNAME not found — try TXT
  }

  const txtHosts = [
    `${txtRecordName}.${hostname}`,
    `${txtRecordName}`,
    hostname,
  ];

  for (const txtHost of txtHosts) {
    try {
      const records = await dns.resolveTxt(txtHost);
      for (const record of records) {
        const value = record.join("");
        if (value === expectedTxt || value.includes(expectedTxt)) {
          return { verified: true, method: "txt" };
        }
      }
    } catch {
      // try next host
    }
  }

  return {
    verified: false,
    error: `CNAME to ${cnameTarget} or TXT ${expectedTxt} not found`,
  };
}

export async function verifyDomainRecord(
  operatorId: string,
  domainId: string,
): Promise<DnsVerifyResult & { domain_id: string }> {
  const domain = await platformPrisma.operator_domains.findFirst({
    where: { id: domainId, operator_id: operatorId },
  });
  if (!domain) {
    throw new Error("Domain not found");
  }

  if (domain.domain_type === "subdomain") {
    await platformPrisma.operator_domains.update({
      where: { id: domainId },
      data: { verification_status: "verified", ssl_status: "active" },
    });
    return { domain_id: domainId, verified: true, method: "cname" };
  }

  const result = await verifyCustomDomainDns(operatorId, domain.hostname);
  await platformPrisma.operator_domains.update({
    where: { id: domainId },
    data: {
      verification_status: result.verified ? "verified" : "failed",
      ssl_status: result.verified ? "active" : domain.ssl_status,
    },
  });

  return { domain_id: domainId, ...result };
}
