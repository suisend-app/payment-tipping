module tipping::tipping {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // Events
    public struct TipSent has copy, drop {
        sender: address,
        recipient: address,
        amount: u64,
        fee: u64,
        message: vector<u8>,
        timestamp: u64,
    }

    // Constants
    const FEE_PERCENTAGE: u64 = 15; // 1.5% = 15/1000
    const FEE_DENOMINATOR: u64 = 1000;

    // Errors
    const EInsufficientAmount: u64 = 0;
    const EInvalidFeeCalculation: u64 = 1;

    // Admin capability
    public struct AdminCap has key, store {
        id: UID,
    }

    // Fee treasury
    public struct FeeTreasury has key {
        id: UID,
        balance: Coin<SUI>,
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx),
        }, tx_context::sender(ctx));

        transfer::share_object(FeeTreasury {
            id: object::new(ctx),
            balance: coin::zero<SUI>(ctx),
        });
    }

    public entry fun send_tip(
        recipient: address,
        payment: Coin<SUI>,
        tip_amount: u64,
        message: vector<u8>,
        treasury: &mut FeeTreasury,
        ctx: &mut TxContext
    ) {
        let fee_amount = (tip_amount * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        let total_amount = tip_amount + fee_amount;

        assert!(coin::value(&payment) >= total_amount, EInsufficientAmount);

        let fee_coin = coin::split(&mut payment, fee_amount, ctx);
        let tip_coin = coin::split(&mut payment, tip_amount, ctx);

        coin::join(&mut treasury.balance, fee_coin);
        transfer::public_transfer(tip_coin, recipient);

        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        } else {
            coin::destroy_zero(payment);
        };

        event::emit(TipSent {
            sender: tx_context::sender(ctx),
            recipient,
            amount: tip_amount,
            fee: fee_amount,
            message,
            timestamp: tx_context::epoch(ctx),
        });
    }

    public entry fun withdraw_fees(
        _: &AdminCap,
        treasury: &mut FeeTreasury,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let withdraw_coin = coin::split(&mut treasury.balance, amount, ctx);
        transfer::public_transfer(withdraw_coin, recipient);
    }

    public fun treasury_balance(treasury: &FeeTreasury): u64 {
        coin::value(&treasury.balance)
    }
}
