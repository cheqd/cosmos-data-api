import { filterArbitrageOpportunities } from './arbitrageOpportunities';

export async function webhookTriggers(event: Event) {
  console.log('Triggering webhook...');
  await sendPriceDiscrepancies();
}

export async function sendPriceDiscrepancies() {
  console.log('Sending price discrepancies...');

  const arbitrageOpportunities = await filterArbitrageOpportunities();
  const hasArbitrageOpportunities = arbitrageOpportunities.length > 0;
  if (hasArbitrageOpportunities) {
    console.log('Arbitrage opportunities...');
    try {
      const init = {
        body: JSON.stringify({
          arbitrage_opportunities: arbitrageOpportunities,
        }),
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      };

      await fetch(WEBHOOK_URL, init);
    } catch (err: any) {
      console.log(err);
    }
  }
}
