import { Request } from "itty-router";
import { Prices } from "../types/prices";
import { CoinGeckoApi } from "../api/coinGeckoApi";

export async function handler(request: Request): Promise<Response> {
    let coinGeckoApi = new CoinGeckoApi(COINGECKO_API);
    let coingecko = await coinGeckoApi.get_coingecko_data();
    let prices = {} as Prices;

    for (let i = 0; i < coingecko.tickers.length; i++) {
        var item = coingecko.tickers[i].market.name;
        switch(item) {
            case 'BitMart':
                prices.bit_mart = coingecko.tickers[i].converted_last.usd;
            break;
            case 'Gate.io':
                prices.gate_io = coingecko.tickers[i].converted_last.usd;
            break;
            case 'Osmosis':
                if (coingecko.tickers[i].target_coin_id === "osmosis") {
                    prices.osmosis_osmo = coingecko.tickers[i].converted_last.usd;
                } else {
                    prices.osmosis_atom = coingecko.tickers[i].converted_last.usd;
                }
            break;
        }
    }

    // Check if there is an arbitrage opportunity. 
    if (
        coinGeckoApi.calculate_difference_percentage(prices.bit_mart, prices.gate_io) < 4 &&
        coinGeckoApi.calculate_difference_percentage(prices.bit_mart, prices.osmosis_atom) < 4 &&
        coinGeckoApi.calculate_difference_percentage(prices.bit_mart, prices.osmosis_osmo) < 4 &&
        coinGeckoApi.calculate_difference_percentage(prices.gate_io, prices.osmosis_atom) < 4 &&
        coinGeckoApi.calculate_difference_percentage(prices.gate_io, prices.osmosis_osmo) < 4 &&
        coinGeckoApi.calculate_difference_percentage(prices.osmosis_atom, prices.osmosis_osmo) < 4) {
            prices.arbitrage_possible = false;
    } else {
        prices.arbitrage_possible = true;
    }

    return new Response(JSON.stringify(prices));
}
