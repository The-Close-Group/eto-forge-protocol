// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "architecture/circuit-breakers.mdx": () => import("../content/docs/architecture/circuit-breakers.mdx?collection=docs"), "architecture/dynamic-market-maker.mdx": () => import("../content/docs/architecture/dynamic-market-maker.mdx?collection=docs"), "architecture/oracle-aggregation.mdx": () => import("../content/docs/architecture/oracle-aggregation.mdx?collection=docs"), "architecture/overview.mdx": () => import("../content/docs/architecture/overview.mdx?collection=docs"), "architecture/peg-stability-module.mdx": () => import("../content/docs/architecture/peg-stability-module.mdx?collection=docs"), "architecture/reflective-price-index.mdx": () => import("../content/docs/architecture/reflective-price-index.mdx?collection=docs"), "introduction/background.mdx": () => import("../content/docs/introduction/background.mdx?collection=docs"), "introduction/trust-and-security.mdx": () => import("../content/docs/introduction/trust-and-security.mdx?collection=docs"), "introduction/what-is-eto.mdx": () => import("../content/docs/introduction/what-is-eto.mdx?collection=docs"), "introduction/what-is-maang.mdx": () => import("../content/docs/introduction/what-is-maang.mdx?collection=docs"), "introduction/user-guide/buy.mdx": () => import("../content/docs/introduction/user-guide/buy.mdx?collection=docs"), "introduction/user-guide/sell.mdx": () => import("../content/docs/introduction/user-guide/sell.mdx?collection=docs"), "introduction/user-guide/stake.mdx": () => import("../content/docs/introduction/user-guide/stake.mdx?collection=docs"), }),
};
export default browserCollections;