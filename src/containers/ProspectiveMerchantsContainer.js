import ProspectiveMerchants from '../components/ProspectiveMerchants';
import { drizzleConnect } from 'drizzle-react';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    BlockMarket: state.contracts.BlockMarket,
    drizzleStatus: state.drizzleStatus
  }
};

const ProspectiveMerchantsContainer = drizzleConnect(ProspectiveMerchants, mapStateToProps);

export default ProspectiveMerchantsContainer;
