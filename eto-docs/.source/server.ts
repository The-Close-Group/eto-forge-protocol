// @ts-nocheck
import * as __fd_glob_17 from "../content/docs/introduction/user-guide/stake.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/introduction/user-guide/sell.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/introduction/user-guide/buy.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/introduction/what-is-maang.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/introduction/what-is-eto.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/introduction/trust-and-security.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/introduction/background.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/architecture/reflective-price-index.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/architecture/peg-stability-module.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/architecture/overview.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/architecture/oracle-aggregation.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/architecture/dynamic-market-maker.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/architecture/circuit-breakers.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_3 } from "../content/docs/introduction/user-guide/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/introduction/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/architecture/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "architecture/meta.json": __fd_glob_1, "introduction/meta.json": __fd_glob_2, "introduction/user-guide/meta.json": __fd_glob_3, }, {"index.mdx": __fd_glob_4, "architecture/circuit-breakers.mdx": __fd_glob_5, "architecture/dynamic-market-maker.mdx": __fd_glob_6, "architecture/oracle-aggregation.mdx": __fd_glob_7, "architecture/overview.mdx": __fd_glob_8, "architecture/peg-stability-module.mdx": __fd_glob_9, "architecture/reflective-price-index.mdx": __fd_glob_10, "introduction/background.mdx": __fd_glob_11, "introduction/trust-and-security.mdx": __fd_glob_12, "introduction/what-is-eto.mdx": __fd_glob_13, "introduction/what-is-maang.mdx": __fd_glob_14, "introduction/user-guide/buy.mdx": __fd_glob_15, "introduction/user-guide/sell.mdx": __fd_glob_16, "introduction/user-guide/stake.mdx": __fd_glob_17, });