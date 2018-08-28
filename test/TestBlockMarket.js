var BlockMarket = artifacts.require('BlockMarket')

contract('BlockMarket', (accounts) => {
    const user1 = accounts[0];
    const user2 = accounts[1];
    const user3 = accounts[2];

    it('should allow first user to register as the administrator', async () => {
        const blockMarket = await BlockMarket.deployed();

        await blockMarket.setAdmin({from: user1});

        const adminUserEntry = await blockMarket.users(user1, {from: user1});
        assert.equal(adminUserEntry[0], 1, 'user should be registered with userID = 1');
        assert.equal(adminUserEntry[1], 'BlockMarket Administrator', 'user name should be fixed to BlockMarket Administrator');
        assert.equal(adminUserEntry[2], 0, 'user should have role = 0, admin');
    });

    it('should allow shopper to register and save their contact information', async () => {
        const blockMarket = await BlockMarket.deployed();
    
        await blockMarket.registerAsShopper('Phil', '123 Main St', 'phil@example.com', 5555555555, {from: user2});

        const shopperUserEntry = await blockMarket.users(user2, {from: user2});
        assert.equal(shopperUserEntry[0], 2, 'user should be registered with userID = 2');
        assert.equal(shopperUserEntry[1], 'Phil', 'user name should be saved as supplied');
        assert.equal(shopperUserEntry[2], 2, 'user should have role = 2, shopper');

        const shopperContactEntry = await blockMarket.contactDetails(user2, {from: user2});
        assert.equal(shopperContactEntry[0], '123 Main St', 'user shipping address should be saved as supplied');
        assert.equal(shopperContactEntry[1], 'phil@example.com', 'user email should be saved as supplied');
        assert.equal(shopperContactEntry[2], 5555555555, 'user phone should be saved as supplied'); 
    });

    it('should allow shopper to request merchant status', async () => {
        const blockMarket = await BlockMarket.deployed();
            
        await blockMarket.requestToBeMerchant('Phil', {from: user2});

        const prospectiveMerchantEntry = await blockMarket.prospectiveMerchants(0, {from: user2});
        assert.equal(prospectiveMerchantEntry[1], 2, 'prospective merchant userID should match requestor userID of 2');
        assert.equal(prospectiveMerchantEntry[2], 'Phil', 'prospective merchant name should be Phil');
                
        const prospectiveMerchantsTotal = await blockMarket.getNumberOfProspectiveMerchants(); 
        assert.equal(prospectiveMerchantsTotal, 1, 'prospective merchants array should now be 1 item long'); 
    });

    it('should allow admin to accept shopper request to become merchant', async () => {
        const blockMarket = await BlockMarket.deployed();
            
        await blockMarket.approveMerchant(0, {from: user1});

        const merchantUserEntry = await blockMarket.users(user2, {from: user2});
        assert.equal(merchantUserEntry[0], 2, 'user should still be registered with userID = 2');
        assert.equal(merchantUserEntry[2], 1, 'user should have role = 1, merchant');
    });

    it('should allow merchant to open store', async () => {
        const blockMarket = await BlockMarket.deployed();
            
        await blockMarket.openStore('Pet Shop', 'Organic Pet Supplies', {from: user2});

        const storeOwned = await blockMarket.storeRegistry(user2, 0, {from: user2});  
        assert.equal(storeOwned, 1, 'merchant should have storeID = 1 in their store registry array');

        const storeEntry = await blockMarket.stores(0, {from: user2});
        assert.equal(storeEntry[0], 1, 'storeID should equal 2');
        assert.equal(storeEntry[1], user2, 'store owner address should be that of user2');
        assert.equal(storeEntry[2], 'Pet Shop', 'store title should be saved as supplied'); 
        assert.equal(storeEntry[3], 'Organic Pet Supplies', 'store description should be saved as supplied'); 

        const storesOwnedTotal = await blockMarket.getNumberOfStoresOwned(user2); 
        assert.equal(storesOwnedTotal, 1, 'stores owned array should now be 1 item long'); 
    });

    it('should allow merchant to add product to store', async () => {
        const blockMarket = await BlockMarket.deployed();
            
        await blockMarket.addProduct(1, 'Dog Bowl', 'Hand Carved Wooden Bowl', 25, 5, 'imgSrc', 1, {from: user2});

        const newProduct = await blockMarket.products(1);  
        assert.equal(newProduct[0], 1, 'product should have sku = 1');
        assert.equal(newProduct[1], 1, 'product should have storeID = 1');
        assert.equal(newProduct[2], 'Dog Bowl', 'product title should be saved as supplied'); 
        assert.equal(newProduct[3], 'Hand Carved Wooden Bowl', 'product description should be saved as supplied'); 
        assert.equal(newProduct[4], 25, 'product price should be saved as supplied');
        assert.equal(newProduct[5], 5, 'product shipping price should be saved as supplied'); 
        assert.equal(newProduct[7], 1, 'product quantity should be saved as supplied'); 
    });

    it('should allow merchant to edit product', async () => {
        const blockMarket = await BlockMarket.deployed();
            
        await blockMarket.editProduct(1, 1, 'Dog Bowl', 'One of a Kind', 30, 5, 'imgSrc', 2, {from: user2});

        const editedProduct = await blockMarket.products(1);  
        assert.equal(editedProduct[0], 1, 'product should have sku = 1');
        assert.equal(editedProduct[1], 1, 'product should have storeID = 1');
        assert.equal(editedProduct[2], 'Dog Bowl', 'product title should be saved as supplied'); 
        assert.equal(editedProduct[3], 'One of a Kind', 'product description should be saved as supplied'); 
        assert.equal(editedProduct[4], 30, 'product price should be saved as supplied');
        assert.equal(editedProduct[5], 5, 'product shipping price should be saved as supplied'); 
        assert.equal(editedProduct[7], 2, 'product quantity should be saved as supplied'); 
    });

    it('should allow shopper to purchase product', async () => {
        const blockMarket = await BlockMarket.deployed();
            
        await blockMarket.placeOrder(1, 1, {from: user3, value: 70});

        const newOrder = await blockMarket.orders(user2, 0, {from: user2});  
        assert.equal(newOrder[0], 1, 'order should have orderID = 1');
        assert.equal(newOrder[1], 1, 'order should have sku = 1');
        assert.equal(newOrder[2], 1, 'order should have storeID = 1'); 
        assert.equal(newOrder[3], user3, 'order should have buyer = user3'); 
        assert.equal(newOrder[4], user2, 'order should have seller = user2'); 
        assert.equal(newOrder[5], 1, 'order should have quantity = 1'); 
        assert.equal(newOrder[6], 35, 'order should have totalPrice = 35'); 

        const merchantUserEntry = await blockMarket.users(user2, {from: user2});
        assert.equal(merchantUserEntry[3], 35, 'merchant should have a balance of 35');

        const orderTotal = await blockMarket.getNumberOfOrders(user2); 
        assert.equal(orderTotal, 1, 'orders array should now be 1 item long'); 
    });

    it('should allow merchant to mark order as shipped', async () => {
        const blockMarket = await BlockMarket.deployed();
            
        await blockMarket.shipOrder(0, {from: user2});

        const orderTotal = await blockMarket.getNumberOfOrders(user2); 
        assert.equal(orderTotal, 0, 'orders array should now be empty'); 
    });
    
    it('should allow merchant to make a withdrawal', async () => {
        const blockMarket = await BlockMarket.deployed();
            
        await blockMarket.withdraw(5, {from: user2});

        const merchantUserEntry = await blockMarket.users(user2); 
        assert.equal(merchantUserEntry[3], 30, 'merchant should now have a balance of 30'); 
    });
});
