module tipping::tipping {

    use std::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::event;
    use std::string;

    /// Platform configuration (shared object)
    struct PlatformConfig has key {
        id: UID,
        platform_address: address,
        fee_bps: u64,       // fee in basis points, e.g., 100 = 1%
        fee_enabled: bool,
    }

    /// Event emitted after each tip
    struct TipEvent has copy, drop {
        sender: address,
        recipient: address,
        amount: u64,
        coin_type: string::String,
        timestamp: u64,
    }

    /// Initialize platform configuration — run once by platform owner
    public fun init_platform_config(
        ctx: &mut TxContext,
        platform_address: address,
    ) {
        let config = PlatformConfig {
            id: object::new(ctx),
            platform_address,
            fee_bps: 100,    // 1% by default
            fee_enabled: true,
        };
        transfer::share_object(config);
    }

    /// Admin: toggle fee on/off
    public fun set_fee_enabled(
        config: &mut PlatformConfig,
        enabled: bool,
        ctx: &TxContext,
    ) {
        assert!(tx_context::sender(ctx) == config.platform_address, 1);
        config.fee_enabled = enabled;
    }

    /// Tip any coin type (SUI, USDC, etc.)
    public fun tip<CoinType>(
        config: &PlatformConfig,
        mut coin: Coin<CoinType>,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let total = coin::value(&coin);

        if (config.fee_enabled && config.fee_bps > 0) {
            let fee = (total * config.fee_bps) / 10_000;
            let payout = total - fee;

            let fee_coin = coin::split(&mut coin, fee, ctx);
            transfer::transfer(fee_coin, config.platform_address);
            transfer::transfer(coin, recipient);
        } else {
            transfer::transfer(coin, recipient);
        };

        event::emit(TipEvent {
            sender,
            recipient,
            amount: total,
            coin_type: string::utf8(b"<coin>"),
            timestamp: tx_context::epoch(ctx),
        });
    }
}
