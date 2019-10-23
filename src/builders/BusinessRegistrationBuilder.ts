import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import { BusinessRegistrationTransaction } from "../transactions";

export class BusinessRegistrationBuilder extends Transactions.TransactionBuilder<BusinessRegistrationBuilder> {
    constructor() {
        super();
        this.data.type = BusinessRegistrationTransaction.type;
        this.data.typeGroup = BusinessRegistrationTransaction.typeGroup;
        this.data.version = 2;
        this.data.fee = Utils.BigNumber.make("5000000000");
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { businessData: {} };
    }

    public businessData(name: string, website: string): BusinessRegistrationBuilder {
        this.data.asset.businessData = {
            name,
            website,
        };

        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): BusinessRegistrationBuilder {
        return this;
    }
}
