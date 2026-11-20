import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type {
  Contract,
  ContractFilter,
  ContractOpening,
} from "../../shared/types";
import {
  findContractBillIds,
  findContractOpenings,
  findContracts,
  findContractYears,
} from "../repositories/contract-repository";

const OPTS = { revalidate: 3600, tags: [CACHE_TAGS.CONTRACTS] };

export const getContracts = unstable_cache(
  async (
    filter: ContractFilter
  ): Promise<{ rows: Contract[]; total: number }> => findContracts(filter),
  ["contracts"],
  OPTS
);

export const getContractYears = unstable_cache(
  async (): Promise<number[]> => findContractYears(),
  ["contract-years"],
  OPTS
);

export const getContractOpenings = unstable_cache(
  async (): Promise<ContractOpening[]> => findContractOpenings(),
  ["contract-openings"],
  OPTS
);

/** Map はキャッシュで壊れるので、配列で持って呼び出し側で Map にする */
export const getContractBillIds = unstable_cache(
  async (): Promise<[string, string][]> => [...(await findContractBillIds())],
  ["contract-bill-ids"],
  { revalidate: 3600, tags: [CACHE_TAGS.CONTRACTS, CACHE_TAGS.BILLS] }
);
