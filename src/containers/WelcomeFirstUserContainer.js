import WelcomeFirstUser from '../components/WelcomeFirstUser';
import { drizzleConnect } from 'drizzle-react';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    BlockMarket: state.contracts.BlockMarket,
    drizzleStatus: state.drizzleStatus
  }
};

const WelcomeFirstUserContainer = drizzleConnect(WelcomeFirstUser, mapStateToProps);

export default WelcomeFirstUserContainer;
