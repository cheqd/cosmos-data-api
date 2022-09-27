import { IHTTPMethods, Request, Router } from 'itty-router'
import { handler as totalSupplyHandler } from "./handlers/totalSupply";
import { handler as totalBalanceHandler } from "./handlers/totalBalance";
import { handler as circulatingSupplyHandler } from "./handlers/circulatingSupply";
import { handler as liquidBalanceHandler } from "./handlers/liquidBalance";
import { handler as vestingBalanceHandler } from "./handlers/vestingBalance";
import { handler as vestedBalanceHandler } from "./handlers/vestedBalance";
import { handler as delegatorCountHandler } from './handlers/delegatorCount';
import { handler as totalDelegatorsHandler } from './handlers/totalDelegators';
import { handler as totalStakedCoinsHandler } from "./handlers/totalStakedCoins";
import { handler as balanceUpdaterHandler } from "./handlers/balanceUpdater";
import { updateAllBalances } from "./handlers/cron";

addEventListener('scheduled', (event: any) => {
    event.waitUntil(updateAllBalances(1, event));
    event.waitUntil(updateAllBalances(2, event));
    event.waitUntil(updateAllBalances(3, event));
})

addEventListener('fetch', (event: FetchEvent) => {
    const router = Router<Request, IHTTPMethods>()
    registerRoutes(router);
    event.respondWith(router.handle(event.request).catch(handleError))
})

function registerRoutes(router: Router) {
    router.get('/', totalSupplyHandler);
    router.get('/balances/liquid/:address', liquidBalanceHandler);
    router.get('/balances/total/:address', totalBalanceHandler);
    router.get('/balances/vested/:address', vestedBalanceHandler);
    router.get('/balances/vesting/:address', vestingBalanceHandler);
    router.get('/staking/delegators/total', totalDelegatorsHandler);
    router.get('/staking/delegators/:validator_address', delegatorCountHandler);
    router.get('/supply/circulating', circulatingSupplyHandler);
    router.get('/supply/staked', totalStakedCoinsHandler);
    router.get('/supply/total', totalSupplyHandler);
    router.get('/', totalSupplyHandler);
    router.get('/_/grp/:grp', balanceUpdaterHandler);
    router.get('/_/:address', balanceUpdaterHandler);

    // 404 for all other requests
    router.all('*', () => new Response('Not Found.', { status: 404 }))
}

function handleError(error: Error): Response {
    return new Response(error.message || 'Server Error', { status: 500 })
}
