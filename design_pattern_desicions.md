# Design Pattern Desicions


## Restricting Access

Users are strictly defined with one of 3 possible user roles: Shoppers, Merchants and Admin (of which there can only be one). Nearly every function is limited to a specific role.

```javascript
    enum Role {
        Admin,
        Merchant,
        Shopper 
    }

    modifier isAdmin(address _address) {
        require (users[_address].role == Role.Admin, 
            "This user is not the Admininistrator."); 
        _;
    }
    modifier isMerchant(address _address) {
        require (users[_address].role == Role.Merchant, 
            "This user is not a Merchant."); 
        _;
    }
    modifier isShopper(address _address) {
        require ((users[_address].userID == 0) || 
            users[_address].role == Role.Shopper, 
            "This user is not a Shopper."); 
        _;
    }
```


## Pull over Push Payments

The contract effectively act's as the merchant's bank. Values sent and withdrawn are seperated among different functions and respective sums held within the contract intermediately. 

Also called the withdrawal pattern, it protects against re-entrancy and denial of service attacks.

```javascript
    function placeOrder() {
        // ...

        // Buyer makes payment into merchant's account
        // Transfer takes place first so as to protect against re-entrancy
        msg.sender.transfer(_totalPrice);
        users[_storeOwner].balance = SafeMath.add(
            users[_storeOwner].balance, _totalPrice);

        users[_storeOwner].orderCount++;

        // ...
    }

    function withdraw() {
        // ...

        // Merchant makes withdrawal against their account balance
        // Balance is debited prior to transfer so as to protect against re-entrancy
        users[msg.sender].balance = SafeMath.sub(users[msg.sender].balance, amount);
        msg.sender.transfer(amount);
        emit withdrawalMade(msg.sender, amount, users[msg.sender].balance);
        return users[msg.sender].balance;

        // ...
    }
```


## Mortal

Ability to destroy the contract and remove it from the blockchain.

```javascript
    function kill() 
        public
        isAdmin(msg.sender)
    {
        selfdestruct(msg.sender);
    }
```


## Circuit Breaker

All non-admin functionality can be frozen.

```javascript
    bool public stopped = false;

    function toggleCircuitBreaker() 
        public
        isAdmin(msg.sender)
    {
        stopped = !stopped;
    }

    // Used with each non-admin function
    modifier isBreakerTripped {        
        require (stopped == false, 
            "Emergency circuit breaker has been tripped."); 
        _;
    }
```


## Fail early and fail loud

Modifiers are used in nearly every function, which in turn use `require`.

```javascript
    modifier isBreakerTripped {        
        require (stopped == false, 
            "Emergency circuit breaker has been tripped."); 
        _;
    }
    modifier isAdmin(address _address) {
        require (users[_address].role == Role.Admin, 
            "This user is not the Admininistrator."); 
        _;
    }
    modifier isMerchant(address _address) {
        require (users[_address].role == Role.Merchant, 
            "This user is not a Merchant."); 
        _;
    }
    modifier isShopper(address _address) {
        require ((users[_address].userID == 0) || 
            users[_address].role == Role.Shopper, 
            "This user is not a Shopper."); 
        _;
    }
    modifier isStoreOwner(address _address, uint _storeID) {
        require (stores[_storeID - 1].owner == msg.sender, 
            "This user is not the store owner."); 
        _;
    }
    modifier isStore(uint _storeID) {
        require (stores[_storeID - 1].storeID != 0, 
            "This is not a valid store."); 
        _;
    }
    modifier isProduct(uint _sku) {
        require (products[_sku].sku != 0, 
            "This is not a valid product."); 
        _;
    }
    modifier isInStock(uint _sku) {
        require (products[_sku].stock > 0, 
            "This item is no longer in stock."); 
        _;
    }
    modifier sufficientFunds(address _address, uint _amount) {
        require(_amount <= users[_address].balance, 
            "This user does not have suffienct funds."); 
        _;
    }
```