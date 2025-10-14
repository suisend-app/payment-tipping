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
        timestamp: u64,
    }

    /// Tip any coin type (SUI, USDC, etc.)
    public fun tip<CoinType>(
        mut coin: Coin<CoinType>,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let total = coin::value(&coin);

        transfer::transfer(coin, recipient);

        event::emit(TipEvent {
            sender,
            recipient,
            amount: total,
            coin_type: string::utf8(b"<coin>"),
            timestamp: tx_context::epoch(ctx),
        });
    }
}
