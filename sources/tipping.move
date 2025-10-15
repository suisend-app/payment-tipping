module tipping::tipping {

    use std::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::event;
    use std::string;

    /// Event emitted after each tip
    struct TipEvent has copy, drop {
        sender: address,
        recipient: address,
        amount: u64,
        coin_type: string::String,
        fee: u64,
        timestamp: u64,
    }

    /// Public entry to tip a recipient using any Coin<T>.
    /// The function charges a 1% fee (integer division) sent to `creator`.
    /// Parameters:
    /// - coin: payment coin object (any Coin<T>)
    /// - recipient: address to receive the tip (amount - fee)
    /// - creator: address that receives the 1% fee
    public entry fun tip<T: copy + drop + store>(mut coin: Coin<T>, recipient: address, creator: address, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let total = coin::value(&coin);
        // compute 1% fee (integer division). Minimum fee is 0 if total < 100
        let fee = total / 100;
        let remainder = total - fee;

        // split out the fee (if fee > 0)
        if (fee > 0) {
            let fee_coin = coin::split(&mut coin, fee, ctx);
            // transfer fee coin to creator (public_transfer used so fee coin can be transferred)
            transfer::public_transfer(fee_coin, creator);
        }
        // transfer the remainder to recipient
        // After splitting, `coin` holds the remaining amount
        transfer::public_transfer(coin, recipient);

        // emit an event with basic info
        event::emit(TipEvent {
            sender,
            recipient,
            amount: remainder,
            coin_type: string::utf8(b"COIN"),
            fee,
            timestamp: tx_context::epoch(ctx),
        });
    }
}
