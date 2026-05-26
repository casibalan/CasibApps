// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal ERC20 interface for USDC transfers.
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

/// @title CasibInvoiceEscrow
/// @notice Accepts USDC payments for CasibApps invoices on Arc.
/// @dev Transfers USDC directly from payer to merchant. No escrow hold.
contract CasibInvoiceEscrow {
    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error ZeroInvoiceId();
    error ZeroMerchant();
    error ZeroAmount();
    error InvoiceAlreadyPaid();
    error TransferFailed();

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event InvoicePaid(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed merchant,
        uint256 amount
    );

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────

    IERC20 public immutable usdc;
    mapping(bytes32 => bool) public paidInvoices;

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    /// @param _usdc The real USDC token address on Arc.
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    // ──────────────────────────────────────────────
    // External
    // ──────────────────────────────────────────────

    /// @notice Pay an invoice by transferring USDC from caller to merchant.
    /// @param invoiceId Unique invoice identifier (bytes32 hash).
    /// @param merchant Recipient merchant address.
    /// @param amount USDC amount in smallest unit (6 decimals).
    function payInvoice(bytes32 invoiceId, address merchant, uint256 amount) external {
        if (invoiceId == bytes32(0)) revert ZeroInvoiceId();
        if (merchant == address(0)) revert ZeroMerchant();
        if (amount == 0) revert ZeroAmount();
        if (paidInvoices[invoiceId]) revert InvoiceAlreadyPaid();

        paidInvoices[invoiceId] = true;

        bool success = usdc.transferFrom(msg.sender, merchant, amount);
        if (!success) revert TransferFailed();

        emit InvoicePaid(invoiceId, msg.sender, merchant, amount);
    }

    /// @notice Check if an invoice has been paid.
    /// @param invoiceId The invoice identifier to check.
    /// @return True if the invoice has been paid.
    function isPaid(bytes32 invoiceId) external view returns (bool) {
        return paidInvoices[invoiceId];
    }
}
