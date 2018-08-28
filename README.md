# Block Market

An online marketplace running on Ethereum.

## Installation

1. Make sure you have Truffle and Ganache CLI installed.
    ```javascript
    npm install -g truffle
    npm install -g ganache-cli
    ```

2. Download the box. This also takes care of installing the necessary dependencies.
    ```javascript
    truffle unbox drizzle
    ```

3. Run the development blockchain with a blocktime. Otherwise, its difficult to track things like loading indicators because Ganache will mine instantly.
    ```javascript
    // 3 second blocktime.
    ganache-cli -b 3
    ```

4. Compile and migrate the smart contracts.
    ```javascript
    truffle compile
    truffle migrate
    ```

5. Launch the development server.
    ```javascript
    // Serves the front-end on http://localhost:3000
    npm run start
    ```

6. Run JavaScript tests against the BlockMarket contract.
    ```javascript
    truffle test
    ```

7. To build the application for production, use the build command. A production build will be in the build_webpack folder.
    ```javascript
    npm run build
    ```