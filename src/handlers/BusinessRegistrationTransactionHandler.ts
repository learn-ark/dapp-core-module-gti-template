import { Database, EventEmitter, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers, TransactionReader } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions } from "@arkecosystem/crypto";
import { BusinessRegistrationAssetError, WalletIsAlreadyABusiness } from "../errors";
import { IBusinessData } from "../interfaces";
import { BusinessRegistrationTransaction } from "../transactions";

export class BusinessRegistrationTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return BusinessRegistrationTransaction;
    }

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public walletAttributes(): ReadonlyArray<string> {
            return [
                "transactionWalletKeyName",
            ];
    }

    public async isActivated(): Promise<boolean> {
        return Managers.configManager.getMilestone().aip11 === true;
    }

    public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
        const reader: TransactionReader = await TransactionReader.create(connection, this.getConstructor());

        while (reader.hasNext()) {
            const transactions = await reader.read();

            for (const transaction of transactions) {
                const wallet: State.IWallet = walletManager.findByPublicKey(transaction.senderPublicKey);
                const asset: IBusinessData = {
                    name: transaction.asset.businessData.name,
                    website: transaction.asset.businessData.website,
                };

                wallet.setAttribute<IBusinessData>("transactionWalletKeyName", asset);
                walletManager.reindex(wallet);
            }
        }
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        wallet: State.IWallet,
        databaseWalletManager: State.IWalletManager,
    ): Promise<void> {
        const { data }: Interfaces.ITransaction = transaction;

        const { name, website }: { name: string; website: string } = data.asset.businessData;
        if (!name || !website) {
            throw new BusinessRegistrationAssetError();
        }

        if (wallet.hasAttribute("transactionWalletKeyName")) {
            throw new WalletIsAlreadyABusiness();
        }

        await super.throwIfCannotBeApplied(transaction, wallet, databaseWalletManager);
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: EventEmitter.EventEmitter): void {
        emitter.emit("business.registered", transaction.data);
    }

    public async canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): Promise<{ type: string, message: string } | null>  {

        const err = await this.typeFromSenderAlreadyInPool(data, pool);
        if (err !== null) {
            return err;
        }

        const { name }: { name: string } = data.asset.businessData;
        const businessRegistrationsSameNameInPayload = processor
            .getTransactions()
            .filter(tx => tx.type === this.getConstructor().type && tx.asset.businessData.name === name);

        if (businessRegistrationsSameNameInPayload.length > 1) {
            return{
                type: "ERR_CONFLICT",
                message: `Multiple business registrations for "${name}" in transaction payload`,
            };
        }

        const businessRegistrationsInPool: Interfaces.ITransactionData[] = Array.from(
            await pool.getTransactionsByType(this.getConstructor().type),
        ).map((memTx: Interfaces.ITransaction) => memTx.data);
        const containsBusinessRegistrationForSameNameInPool: boolean = businessRegistrationsInPool.some(
            transaction => transaction.asset.businessData.name === name,
        );
        if (containsBusinessRegistrationForSameNameInPool){
            return {
                type: "ERR_PENDING",
                message: `Business registration for "${name}" already in the pool`,
            }
        }

        return null;
    }

    public async applyToSender(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        await super.applyToSender(transaction, walletManager);
        const sender: State.IWallet = walletManager.findByPublicKey(transaction.data.senderPublicKey);
        sender.setAttribute<IBusinessData>("transactionWalletKeyName", transaction.data.asset.businessData);
        walletManager.reindex(sender);
    }

    public async revertForSender(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        await super.revertForSender(transaction, walletManager);
        const sender: State.IWallet = walletManager.findByPublicKey(transaction.data.senderPublicKey);
        sender.forgetAttribute("transactionWalletKeyName");
        walletManager.reindex(sender);
    }

    public async applyToRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        return;
    }

    public async revertForRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        return;
    }
}
