module tipping::tipping {

    use sui::tx_context::TxContext;
    use sui::coin::Coin;
    use sui::transfer;
    use sui::event;

    public struct TipEvent has copy, drop {
        amount: u64,
        recipient: address,
        creator: address,
    }

    public fun emit_tip_event(
        amount: u64,
        recipient: address,
        creator: address,
        _ctx: &mut TxContext
    ) {
        // ✅ Correct: event::emit takes only ONE argument
        event::emit(TipEvent {
            amount,
            recipient,
            creator,
        });
    }

    public fun tip<T: copy + drop + store>(
        coin: Coin<T>,
        recipient: address,
        creator: address,
        ctx: &mut TxContext
    ) {
        let amount = sui::coin::value(&coin);
        emit_tip_event(amount, recipient, creator, ctx);
        // ✅ Correct: must use public_transfer
        transfer::public_transfer(coin, recipient);
    }
}
