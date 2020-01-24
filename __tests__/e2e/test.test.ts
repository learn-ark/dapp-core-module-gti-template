import "jest-extended";

import { Managers, Transactions } from "@arkecosystem/crypto";
import { BusinessRegistrationBuilder } from "../../src/builders";
import { BusinessRegistrationTransaction } from "../../src/transactions";
import { RestClient } from "./rest-client"; 

describe("When e2e network is running with the plugin",()=>{
    it("Should accept the transaction", async ()=> {
        Managers.configManager.setFromPreset("testnet");
        Managers.configManager.setHeight(2); // v2 transactions (aip11) are available from height 2
        Transactions.TransactionRegistry.registerTransactionType(BusinessRegistrationTransaction);

        const builder = new BusinessRegistrationBuilder();
        const actual = builder
            .businessData("google","http://www.google.com")
            .nonce("3")
            .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

        const txJson = actual.build().toJson();
        const result = await RestClient.broadcast([txJson]);
        expect(result.body.data).toEqual({
            accept: [txJson.id],
            broadcast: [txJson.id],
            excess: [],
            invalid: []
        });
    });
});
