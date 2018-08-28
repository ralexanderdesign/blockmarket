# Measures Taken to Avoid Common Attacks


## Re-entrancy

Special consideration was given to `payable` functions to guard against re-entrancy. Pull over push payments (withdrawal pattern) are used.  

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


## Cross-function Race Conditions

As described above regarding re-entrancy, balances are debited first before withdrawals are made, while balances are credited last in the case of payments.


## Transaction-Ordering Dependence (TOD) / Front Running

In the case of an online market place, the only situations where this might come into play would be of comparatively less importance as in other contracts.  A shopper could conceivably front-run another shopper's order of a product low in stock.  Or, a user may see a pending price change and time their purchase accordingly. Perhaps a mutex lock for a shopping cart would be a value addition for a later date. 


## Timestamp Dependence

As the timestamp of a block can be manipulated by the miner, only a single time stamp has been used. It is included in the order data, but only used for display and not in any contract logic.


## Integer Overflow and Underflow

The SafeMath library is included to guard against these vulnerabilities.

```javascript
    function withdraw() { 
        // ...

        users[msg.sender].balance = SafeMath.sub(users[msg.sender].balance, amount);
        
        // ...
    }
```


## DoS with Block Gas Limit

While the marketplace could conceivably become big enough to reach array sizes that would need to be split among blocks, implementing successive transactions was admittedly beyond the goal of MVP.


## Forcibly Sending Ether to a Contract

A simple fallback function free of any contract logic is implemented. Furthermore, the `selfdestruct` method can only be called by the admin and will only transfer Ether to the admin.

```javascript
    function kill() 
        public
        isAdmin(msg.sender)
    {
        selfdestruct(msg.sender);
    }

    function() public payable {
    }
```
