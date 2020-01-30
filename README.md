![Imgur](https://i.imgur.com/8wiwey2.jpg)
# Template: dApp Custom Transaction Implementation Skeleton

![Test](https://github.com/learn-ark/dapp-core-module-gti-template/workflows/Test/badge.svg)

This is a basic template of ARK dApp development, by using our CustomTransaction Logic approach.

> This Example is currently operational only on our `core/develop` branch!

This dApp enables a new transaction type on the ARK Core blockchain. New transaction types follows existing blockchain protocol.

### Specification:

Purpose: Enables registration of a new business identity on the Core blockchain (with custom fields like name and website).

TransactionType: `BusinessRegistration`
Fields:

-   name: string
-   website: string | uri

Registered Transaction is fully compatible with existing [API (api/transactions/)](https://api.ark.dev/public-rest-api/endpoints/transactions)

## dApp Installation

### STEP 0: Create New Repository Based On This Template

### STEP 1: Checkout Your New dApp Repository As a GitSubmodule in core/plugins
You should already have a running core and a local Testnet running. If not head over to https://learn.ark.dev/core-getting-started/spinning-up-your-first-testnet#step-2-testnet-network-boot.

```bash
cd plugins/ #location for loading of custom non-core dApps
git submodule add -f https://github.com/your-gh-handle/your-dapp-name
cd your-dapp-name
```
### STEP 2: Load The dApp Module In The Corresponding Network Configurations.

Go to:
`core/packages/core/bin/testnet`

```bash
cd packages/core/bin/config/testnet
```

Locate file `plugins.js`. We will add our plugin name to end of the list of the loaded plugins. This means that core will pickup the plugin/dapp and load it for a specific network configuration. Add line `"@arkecosystem/custom-transactions": {}`: to the end of the `plugins.js` file, so it looks something like this:

```typescript
    "@arkecosystem/core-exchange-json-rpc": {
        enabled: process.env.CORE_EXCHANGE_JSON_RPC_ENABLED,
        host: process.env.CORE_EXCHANGE_JSON_RPC_HOST || "0.0.0.0",
        port: process.env.CORE_EXCHANGE_JSON_RPC_PORT || 8080,
        allowRemote: false,
        whitelist: ["127.0.0.1", "::ffff:127.0.0.1"],
    },
    "@arkecosystem/core-snapshots": {},
    "@arkecosystem/custom-transactions": {}, //our application hook (here we load the plugin/dapp)
```

**IMPORTANT**
After you have changed the content of `plugins.js` you need to run `yarn setup` from the `core` root folder. This will pick up your newly registered plugin and build it.

### STEP 3: Setup Development Docker Database

Setup docker database config and run Postgres DB via Docker. Follow the steps from here:
https://learn.ark.dev/core-getting-started/spinning-up-your-first-testnet#step-1-start-docker-testnet-database

### STEP 4: Start Local Testnet Blockchain

Start local blockchain with testnet running on your developer computer. Follow steps defined in here:
https://learn.ark.dev/core-getting-started/spinning-up-your-first-testnet#step-2-testnet-network-boot

### STEP 5: Send New Custom Transaction To The Local Node

Send your new transaction type payload to the local blockchain node with the following `curl` command:

```bash
curl --request POST \
  --url http://127.0.0.1:4003/api/v2/transactions \
  --header 'content-type: application/json' \
  --data '      {
                "transactions":
                [
                        {
                                "version": 2,
                                "network": 23,
                                "typeGroup": 1001,
                                "type": 100,
                                "nonce": "3",
                                "senderPublicKey":
                                 "03287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37",
                                "fee": "5000000000",
                                "amount": "0",
                                "asset":
                                        { "businessData": { "name": "google", "website": "www.google.com" } },
                                "signature":
                                 "809dac6e3077d6ae2083b353b6020badc37195c286079d466bb1d6670ed4e9628a5b5d0a621801e2763aae5add41905036ed8d21609ed9ddde9f941bd066833c",
                                "id":
                                 "b567325019edeef0ce5a1134af0b642a54ed2a8266a406e1a999f5d590eb5c3c" }
                ]
        }'
```

You should receive a response similar to this:

```json
{
    "data": {
        "accept": ["b567325019edeef0ce5a1134af0b642a54ed2a8266a406e1a999f5d590eb5c3c"],
        "broadcast": ["b567325019edeef0ce5a1134af0b642a54ed2a8266a406e1a999f5d590eb5c3c"],
        "excess": [],
        "invalid": []
    }
}
```

> You can create more transaction payloads by looking at the `__tests__` folder. In short it is as simple as:

```typescript
const builder = new BusinessRegistrationBuilder();
        const actual = builder
            .businessData("google","www.google.com")
            .nonce("3")
            .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");


        console.log(actual.build().toJson());
```
You are using the builder classes you already implemented as part of the plugin.

#### Use Block Explorer To View&Search Local Running Testnet

Click here to setup local blockchain explorer in a few simple steps:
https://learn.ark.dev/core-getting-started/setup-local-blockchain-explorer

---

Congrats, your dapp is loaded. Now look at the resources below to understand more about our dapp development.

-   [Introduction To Custom Transactions](https://blog.ark.io/an-introduction-to-blockchain-application-development-part-2-2-909b4984bae)
-   [Learn Development With ARK](https://learn.ark.dev)

## License

[MIT](LICENSE) © [ArkEcosystem](https://ark.io)
