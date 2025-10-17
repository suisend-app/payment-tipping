module tipping::tipping {

   use sui::tx_context::TxContext;
use sui::coin::Coin;
use sui::transfer;
use sui::object::UID;
use sui::event;


    /// Event emitted for every successful tip
    public struct TipEvent has copy, drop {
        amount: u64,
        coin_type: string::String,
        sender: address,
        recipient: address,
        creator: address,
        timestamp: u64,
    }

    /// Emits an on-chain TipEvent
    fun emit_event(
        amount: u64,
        coin_type: string::String,
        sender: address,
        recipient: address,
        creator: address,
        ctx: &mut TxContext
    ) {
        let event = TipEvent {
            amount,
            coin_type,
            sender,
            recipient,
            creator,
            timestamp: 0,
        };
        event::emit(event);
    }

    /// Main tipping function
    ///
    /// Transfers `coin` of any type `T` (e.g., SUI, USDC) to the recipient,
    /// and emits an on-chain TipEvent for transparency.
    public fun tip<T: copy + drop + store>(
        mut coin: Coin<T>,
        recipient: address,
        creator: address,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&coin);
        transfer::transfer(coin, recipient);
        let coin_type_str = type_name<T>();
        emit_event(
            amount,
            coin_type_str,
            tx_context::sender(ctx),
            recipient,
            creator,
            ctx
        );
    }
}
