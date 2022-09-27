import { NodeApi } from "../api/nodeApi";
import { updateBalance } from "../helpers/balance";
import { Account } from "../types/bigDipper";

export async function updateAllBalances(group: number, event: Event) {
    let node_api = new NodeApi(REST_API);
    let balances: { account: String, balances: Account } [] = [];

    try {
        const cached = await CIRCULATING_SUPPLY_WATCHLIST.list({ prefix: `grp_${group}:` });

        console.log(`found ${cached.keys.length} cached accounts`)
        for (const key of cached.keys) {
            const found = await CIRCULATING_SUPPLY_WATCHLIST.get(key)

            if (found) {
                let addr: string;
                if (key.name.startsWith("grp_")) {
                    const parts = key.name.split(':')
                    addr = parts[1]
                } else {
                    addr = key.name
                }

                const res = await updateBalance(node_api, addr)

                if (res !== undefined) {
                    const data = await res.json() as Account;
                    console.log(`updating account (grp_${group}:${addr}) balance (${data})`)
                    balances.push({ account: addr, balances: data })
                }
            }
        }

        return new Response(JSON.stringify(balances));
    } catch (e) {
        console.error(e)
    }
}
