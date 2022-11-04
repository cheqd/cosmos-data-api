import { Request } from 'itty-router';
import {
  is_vesting_account_type,
  isValidAddress,
} from '../helpers/validate';
import { NodeApi } from '../api/nodeApi';
import { estimatedVesting } from '../helpers/vesting';
import { ncheq_to_cheq_fixed } from '../helpers/currency';

export async function handler(request: Request): Promise<Response> {
  const address = request.params?.['address'];

  if (!address || !isValidAddress(address)) {
    throw new Error('No address specified or wrong address format.');
  }

  let api = new NodeApi(REST_API);
  const account = await api.getAccountInfo(address);

  if (!is_vesting_account_type(account['@type'])) {
    throw new Error(
      `Only vesting accounts are supported. Accounts type '${account['@type']}'.`
    );
  }

  let vestingCoins = estimatedVesting(account)?.vesting;

  return new Response(ncheq_to_cheq_fixed(vestingCoins!!));
}
