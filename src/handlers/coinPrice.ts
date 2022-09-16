import { Price, Payload, ArbitrageOpportunity } from "../types/prices";
import { CoinGeckoApi } from "../api/coinGeckoApi";

export async function fetchPrices() {
  console.log("fetching coingeko data");
  let coinGeckoApi = new CoinGeckoApi(COINGECKO_API);
  let coingecko = await coinGeckoApi.get_coingecko_data();
  console.log("coingecko data", coingecko);
  var prices = new Array<Price>();
  var arbitrage_opportunities = new Array<ArbitrageOpportunity>();

  coingecko.tickers.forEach((ticker) => {
    let coin_pair: Price = {
      market: ticker.market.name,
      coin_pair:
        ticker.coin_id === "cheqd-network"
          ? ticker.target_coin_id
          : ticker.coin_id,
      price: ticker.converted_last.usd,
    };
    prices.push(coin_pair);
  });

  arbitrage_opportunities = coinGeckoApi.arbitrage_opportunities(prices);
  const is_arbitrage_opportunity = arbitrage_opportunities.length > 0;
  var payload: Payload = {
    markets: prices,
    arbitrage_oportunities: arbitrage_opportunities,
    arbitrage_oportunity: is_arbitrage_opportunity,
  };
  return payload;
}
export async function handler(request: Request): Promise<Response> {
  const payload = await fetchPrices();
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });
}
