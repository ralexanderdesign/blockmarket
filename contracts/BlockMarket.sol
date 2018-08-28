pragma solidity ^0.4.24;

import "./base/SafeMath.sol";

/**
    @title BlockMarket
    @dev This contract creates a blockchain-based online BlockMarket where users 
    can apply to become merchants and open their own stores.
    @author Richard A. Serdici
*/
contract BlockMarket {

    // CONTRACT CIRCUIT BREAKER

    bool public stopped = false;

    // ADMIN INITIALIZED FLAG

    bool public adminInitialized = false;

    // USER VARIABLES

    /** @dev Every user not an admin or merchant is a Shopper, even if anonymous 
        (no user account). The shopper role here provides the ability for a 
        shopper to register and save their shipping information, etc.
    */
    enum Role {
        Admin,
        Merchant,
        Shopper 
    }
    
    /** @dev Increments with each new user and serves as unique key for each. 
    */
    uint public userCount; 

    /** @dev Identified by userCount at time of registration (Admin's 
        userID = 1).
    */
    struct User {
        uint userID;
        string name;
        Role role;
        uint balance;
        uint orderCount;
    }

    /** @dev Mapped from address.
    */
    mapping (address => User) public users;

    /** @dev Shoppers who are applying to become merchants.
    */
    struct ProspectiveMerchant {
        address prospectAddress;
        uint userID;
        string name;
    }

    /** @dev Array of applicants to become merchants.
    */
    ProspectiveMerchant[] public prospectiveMerchants;

    /** @dev Optional shopper contact details including shipping address, email 
        and phone.
    */
    struct ContactDetail {
        string shippingAddress;
        string email;
        uint40 phone;
    }

    /** @dev Mapped from address, like user account.
    */
    mapping (address => ContactDetail) public contactDetails;


    // STORE VARIABLES

    /** @dev Increments with each new store and serves as unique key for each. 
    */
    uint public storeCount;

    /** @dev Identified by storeCount at time of store opening. Includes owner's 
        userID for easy look up.
    */
    struct Store {
        uint storeID;
        address owner;
        string title;
        string description;
    }
    
    /** @dev Mapped from storeID.
    */
    Store[] public stores;

    /** @dev Store ownership array mapped to user address.
    */
    mapping (address => uint[]) public storeRegistry;

    // PRODUCT VARIABLES
    
    /** @dev Increments with each new store and serves as unique key for each 
        product. 
    */
    uint public skuCount;

    /** @dev Identified by skuCount at time of product creation. Includes 
        storeID for easy look up. Images will be stored off-chain and source 
        path stored here.
    */
    struct Product {
        uint sku;
        uint storeID;
        string title;
        string description;
        uint price;
        uint shippingPrice;
        string image; 
        uint16 stock;
    }

    /** @dev Mapped from sku.
    */
    mapping (uint => Product) public products;

    /** @dev Products in a store, mapped to storeID
    */
    mapping (uint => uint[]) public productRegistry;


    // ORDER VARIABLES

    /** @dev Record of order for each product (combining quantities).
    */
    struct Order {
        uint orderID;
        uint sku;
        uint storeID;
        address buyer;
        address seller;
        uint quantity;
        uint totalPrice;
        uint timeStamp;
    }

    /** @dev Mapped from address, gives each merchant a dynamic array of product 
        orders.
    */
    mapping (address => Order[]) public orders;


    // EVENTS

    event adminSet (address adminAddress); 
    event merchantApproved (address merchantAddress); 
    event merchantRejected (address merchantAddress); 
    event storeOpened(uint storeID);
    event productAdded(uint sku);
    event orderPlaced(address buyerAddress, uint totalPrice);
    event orderShipped(address buyerAddress, uint sku);
    event withdrawalMade(address merchantAddress, uint amount, uint newBalance);


    // MODIFIERS

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


    // CONSTRUCTOR

    /** @dev Set counters to 1 because as solidity will effectively instantiate
        variables to 0, check for not 0 as proof of true instantiation.
    */
    constructor() public {
        userCount = 1;
        storeCount = 1;
        skuCount = 1;
    }


    // GETTER FUNCTIONS 

    /** @dev Calculate length of prospective merchants array
        @return Returns length integer
    */
    function getNumberOfProspectiveMerchants() public view returns(uint) {
        return prospectiveMerchants.length;
    }
    
    /** @dev Calculate length of a specific user's stores array
        @return Returns length integer
    */
    function getNumberOfStoresOwned(address _user) public view returns(uint) {
        return storeRegistry[_user].length;
    }

    /** @dev Calculate length of a specific user's orders array
        @return Returns length integer
    */
    function getNumberOfOrders(address _user) public view returns(uint) {
        return orders[_user].length;
    }


    // ADMIN FUNCTIONS

    /** @dev Set admin to first visitor
        @return Returns true if first user
    */
    function setAdmin() public returns (bool) {
        require(userCount == 1, "There can be only one!");
        User memory _user;
        _user.userID = userCount;
        _user.name = "BlockMarket Administrator";
        _user.role = Role.Admin;
        _user.balance = 0;
        _user.orderCount = 0;
        users[msg.sender] = _user;
        
        adminInitialized = true;

        emit adminSet(msg.sender);
        userCount++;

        return true;
    }

    /** @dev Destroy contract and remove it from the blockchain
    */
    function kill() 
        public
        isAdmin(msg.sender)
    {
        selfdestruct(msg.sender);
    }
    
    /** @dev Toggle circuit breaker
    */
    function toggleCircuitBreaker() 
        public
        isAdmin(msg.sender)
    {
        stopped = !stopped;
    }

    /** @dev Allows admin to approve a shopper's request to be a merchant.
        @param prospectIndex Array index of shopper requesting to be merchant.
        @return New merchant's address
    */
    function approveMerchant(uint prospectIndex) 
        public
        isAdmin(msg.sender)
        returns (address)
    {
        address _address = prospectiveMerchants[prospectIndex].prospectAddress;     

        users[_address].role = Role.Merchant;

        // Delete prospectiveMerchant and shift array
        require(prospectIndex <  prospectiveMerchants.length, 
            "This order does not exist.");
        for (uint i = prospectIndex; i < prospectiveMerchants.length - 1; i++) {
            prospectiveMerchants[prospectIndex] = prospectiveMerchants[prospectIndex + 1];
        }
        delete prospectiveMerchants[prospectiveMerchants.length - 1];
        prospectiveMerchants.length--;

        emit merchantApproved(_address);
        return _address;
    }

    /** @dev Allows admin to reject a shopper's request to be a merchant.
        @param prospectIndex Array index of shopper requesting to be merchant.
        @return Rejected merchant's address
    */
    function rejectMerchant(uint prospectIndex) 
        public
        isAdmin(msg.sender)
        returns (address)
    {       
        address _address = prospectiveMerchants[prospectIndex].prospectAddress; 

        // Delete prospectiveMerchant and shift array
        require(prospectIndex <  prospectiveMerchants.length, 
            "This prospective merchant does not exist.");
        for (uint i = prospectIndex; i < prospectiveMerchants.length - 1; i++) {
            prospectiveMerchants[prospectIndex] = prospectiveMerchants[prospectIndex + 1];
        }
        delete prospectiveMerchants[prospectiveMerchants.length - 1];
        prospectiveMerchants.length--;
        
        emit merchantRejected(_address); 
        return _address;
    }


    // MERCHANT FUNCTIONS

    /** @dev Allows merchants to open new stores.
        @param _title Store title
        @param _description Store description
        @return ID of new store
    */
    function openStore(
        string _title,
        string _description)
        public 
        isBreakerTripped()
        isMerchant(msg.sender)
        returns (uint)
    {
        Store memory _store;
        _store.storeID = storeCount;
        _store.owner = msg.sender;
        _store.title = _title;
        _store.description = _description;

        stores.push(_store);
        
        storeRegistry[msg.sender].push(storeCount);

        emit storeOpened(storeCount);
        storeCount++;
        return storeCount - 1;
    }

    /** @dev Allows merchants to add new products.
        @param _storeID ID of store product is in
        @param _title Product title
        @param _description Product description
        @param _price Product price
        @param _shippingPrice Product shipping price
        @param _image Product image's source
        @param _stock Product stock quantity
        @return SKU of new product
    */
    function addProduct(
        uint _storeID,
        string _title, 
        string _description, 
        uint _price, 
        uint _shippingPrice, 
        string _image, 
        uint16 _stock) 
        public 
        isBreakerTripped()
        isStoreOwner(msg.sender, _storeID)
        returns (uint)
    {
        uint _sku = skuCount;

        products[_sku] = Product({
            sku: _sku,
            storeID: _storeID,
            title: _title,
            description: _description,
            price: _price,
            shippingPrice: _shippingPrice,
            image: _image,
            stock: _stock});

        productRegistry[_storeID].push(_sku);

        emit productAdded(skuCount);
        skuCount++;
        return _sku;
    }

    /** @dev Allows merchants to edit their products. Like with contact details,
        function recreates and replaces struct each time to keep logic simple 
        and avoid diff'ing.
        @param sku Product SKU (key)
        @param _storeID ID of store product is in
        @param _title Product title
        @param _description Product description
        @param _price Product price
        @param _shippingPrice Product shipping price
        @param _image Product image's source
        @param _stock Product stock quantity
        @return SKU of edited product
    */
    function editProduct(
        uint sku,
        uint _storeID,
        string _title, 
        string _description, 
        uint _price, 
        uint _shippingPrice, 
        string _image, 
        uint16 _stock) 
        public  
        isBreakerTripped()
        isProduct(sku) 
        isStoreOwner(msg.sender, products[sku].storeID)
        returns (uint)
    {
        delete products[sku];
        
        products[sku] = Product({
            sku: sku,
            storeID: _storeID,
            title: _title,
            description: _description,
            price: _price,
            shippingPrice: _shippingPrice,
            image: _image,
            stock: _stock});

        return sku;
    } 

    /** @dev Allows merchants to remove their products.
        @param sku Product SKU (key)
        @return SKU of removed product
    */
    function removeProduct(
        uint sku) 
        public 
        isBreakerTripped()
        isProduct(sku) 
        isStoreOwner(msg.sender, products[sku].storeID)
        returns (uint)
    {
        delete products[sku];
        return sku;
    }

    /** @dev Allows merchants make withdrawals against their balances.
        @param amount Amount to withdraw
        @return New balance
    */
    function withdraw(uint amount) 
        public 
        payable 
        isBreakerTripped()
        isMerchant(msg.sender)
        sufficientFunds(msg.sender, amount) 
        returns (uint)
    {
        users[msg.sender].balance = SafeMath.sub(users[msg.sender].balance, amount);
        msg.sender.transfer(amount);
        emit withdrawalMade(msg.sender, amount, users[msg.sender].balance);
        return users[msg.sender].balance;
    }

    /** @dev Allows merchants to mark orders as shipped.  This will also clear 
        the sales order from their queue.
        @param orderIndex Index of specific order in respective user's own array
        @return Buyer's address
    */
    function shipOrder(uint orderIndex) 
        public 
        isBreakerTripped()
        returns (uint)
    {
        uint _orderID = orders[msg.sender][orderIndex].orderID;
        
        // Delete order and shift array
        require(orderIndex <  orders[msg.sender].length, 
            "This order does not exist.");
        for (uint i = orderIndex; i < orders[msg.sender].length - 1; i++) {
            orders[msg.sender][orderIndex] = orders[msg.sender][orderIndex + 1];
        }
        delete orders[msg.sender][orders[msg.sender].length - 1];
        orders[msg.sender].length--;

        return _orderID;
    }


    // SHOPPER FUNCTIONS

    /** @dev Allows anonymous shoppers to register so that they can save their 
        contact info.
        @param _name User's name
        @param _shippingAddress User's shipping address
        @param _email User's email address
        @param _phone User's phone number
        @return True upon success
    */
    function registerAsShopper(
        string _name, 
        string _shippingAddress, 
        string _email, 
        uint40 _phone) 
        public 
        isBreakerTripped()
        returns (bool)
    {
        if (users[msg.sender].userID == 0) {

            User memory _user;
            _user.userID = userCount;
            _user.name = _name;
            _user.role = Role.Shopper;
            _user.balance = 0;
            _user.orderCount = 0;
            users[msg.sender] = _user;

            userCount++;
        }
        updateContactDetail(_shippingAddress, _email, _phone);

        return true;
    }

    /** @dev Edits contact details. Data is short so function recreates and
        replaces struct each time to keep logic simple and avoid diff'ing.   
        @param _shippingAddress User's shipping address
        @param _email User's email address
        @param _phone User's phone number
        @return Address of updated user
    */
    function updateContactDetail(
        string _shippingAddress, 
        string _email, 
        uint40 _phone) 
        public 
        isBreakerTripped()
        returns (address)
    {
        contactDetails[msg.sender] = ContactDetail({
            shippingAddress: _shippingAddress,
            email: _email,
            phone: _phone});
        return msg.sender;
    }

    /** @dev Allows shoppers, either anonymous or registered, to apply to become
        merchants.
        @param _name User's name
        @return Success bool
    */
    function requestToBeMerchant(
        string _name) 
        public
        isBreakerTripped()
        isShopper(msg.sender)
        returns (bool)
    {
        if (users[msg.sender].userID == 0) {
            
            User memory _user;
            _user.userID = userCount;
            _user.name = _name;
            _user.role = Role.Shopper;
            _user.balance = 0;
            _user.orderCount = 0;
            users[msg.sender] = _user;

            userCount++;
        }
        ProspectiveMerchant memory _ProspectiveMerchant;
        _ProspectiveMerchant.prospectAddress = msg.sender;
        _ProspectiveMerchant.userID = users[msg.sender].userID;
        _ProspectiveMerchant.name = users[msg.sender].name;     
        prospectiveMerchants.push(_ProspectiveMerchant);

        return true;
    }

    /** @dev Each product generates a seperate order on check out (but with 
        quantites combined) so that they can be properly routed to respective
        store owners. This provides for shoppers filling a cart and purchasing 
        items from multiple merchants at once. Will be called in a loop by 
        front-end for each product in cart.
        @param _sku Product SKU (key)
        @param _quantity Product quantity being purchased
        @return Buyer's address, total price and seller's address
    */
    function placeOrder(
        uint _sku,
        uint _quantity) 
        public
        payable
        isBreakerTripped()
        isProduct(_sku) 
        isInStock(_sku)
        returns (address, uint, address)
    {
        // Find store product belongs to and owner of store in turn.
        uint _storeID = products[_sku].storeID;
        address _storeOwner = stores[_storeID - 1].owner;

        // Calculate total price of order
        uint _singleItemPrice = SafeMath.add(
            products[_sku].price, 
            products[_sku].shippingPrice);
        uint _totalPrice;
        if(_quantity > 1) {
            _totalPrice = SafeMath.mul(
            _singleItemPrice, 
            _quantity);
        } else {
            _totalPrice = _singleItemPrice;
        }

        // Make actual payment
        msg.sender.transfer(_totalPrice);
        users[_storeOwner].balance = SafeMath.add(
            users[_storeOwner].balance, _totalPrice);

        users[_storeOwner].orderCount++;

        // Place order
        Order memory _order;
        _order.orderID = users[_storeOwner].orderCount;
        _order.sku = _sku;
        _order.storeID = _storeID;
        _order.buyer = msg.sender;
        _order.seller = _storeOwner;
        _order.quantity = _quantity;
        _order.totalPrice = _totalPrice;
        _order.timeStamp = now;

        orders[_storeOwner].push(_order);

        emit orderPlaced(msg.sender, _totalPrice);
        return (msg.sender, _totalPrice, _storeOwner);
    }

    /** @dev Payable fallback
    */
    function() public payable {
    }
}
