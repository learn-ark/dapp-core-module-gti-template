import "jest-extended";

import { Managers, Transactions } from "@arkecosystem/crypto";
import { BusinessRegistrationBuilder } from "../../src/builders";
import { BusinessRegistrationTransaction } from "../../src/transactions";

describe("Test builder",()=>{
    it("Should verify correctly", ()=> {
        Managers.configManager.setFromPreset("testnet");
        Managers.configManager.setHeight(2); // v2 transactions (aip11) are available from height 2
        Transactions.TransactionRegistry.registerTransactionType(BusinessRegistrationTransaction);

        const builder = new BusinessRegistrationBuilder();
        const actual = builder
            .businessData("google","http://www.google.com")
            .nonce("3")
            .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");


        console.log(actual.build().toJson());
        expect(actual.build().verified).toBeTrue();
        expect(actual.verify()).toBeTrue();
    });
});
