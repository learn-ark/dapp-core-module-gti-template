// tslint:disable:max-classes-per-file
import { Errors } from "@arkecosystem/core-transactions";

export class BusinessRegistrationAssetError extends Errors.TransactionError {
  constructor() {
    super(`Incomplete business registration asset.`);
  }
}

export class WalletIsAlreadyABusiness extends Errors.TransactionError {
  constructor() {
    super(`Wallet is already a business.`);
  }
}
