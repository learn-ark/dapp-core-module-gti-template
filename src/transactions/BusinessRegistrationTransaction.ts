import { Transactions, Utils } from "@arkecosystem/crypto";
import ByteBuffer from "bytebuffer";
import { IBusinessData } from "../interfaces";

const { schemas } = Transactions;

const BUSINESS_REGISTRATION_TYPE = 100;
const BUSINESS_REGISTRATION_TYPE_GROUP = 1001;

export class BusinessRegistrationTransaction extends Transactions.Transaction {
    public static typeGroup: number = BUSINESS_REGISTRATION_TYPE_GROUP;
    public static type: number = BUSINESS_REGISTRATION_TYPE;
    public static key: string = "business_key";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "businessData",
            required: ["asset", "typeGroup"],
            properties: {
                type: { transactionType: BUSINESS_REGISTRATION_TYPE },
                typeGroup: { const: 1001 },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                asset: {
                    type: "object",
                    required: ["businessData"],
                    properties: {
                        businessData: {
                            type: "object",
                            required: ["name", "website"],
                            properties: {
                                name: {
                                    $ref: "genericName",
                                },
                                website: {
                                    $ref: "uri",
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.make("5000000000");

    public serialize(): ByteBuffer {
        const { data } = this;

        const businessData = data.asset.businessData as IBusinessData;

        const nameBytes = Buffer.from(businessData.name, "utf8");
        const websiteBytes = Buffer.from(businessData.website, "utf8");

        const buffer = new ByteBuffer(nameBytes.length + websiteBytes.length + 2, true);

        buffer.writeUint8(nameBytes.length);
        buffer.append(nameBytes, "hex");

        buffer.writeUint8(websiteBytes.length);
        buffer.append(websiteBytes, "hex");

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const businessData = {} as IBusinessData;
        const nameLength = buf.readUint8();
        businessData.name = buf.readString(nameLength);

        const websiteLength = buf.readUint8();
        businessData.website = buf.readString(websiteLength);

        data.asset = {
            businessData,
        };
    }
}
