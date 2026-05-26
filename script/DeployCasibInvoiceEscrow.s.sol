// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CasibInvoiceEscrow} from "../contracts/CasibInvoiceEscrow.sol";

/// @title DeployCasibInvoiceEscrow
/// @notice Deployment script for CasibInvoiceEscrow on Arc testnet.
contract DeployCasibInvoiceEscrow is Script {
    function run() external {
        address usdcToken = vm.envAddress("USDC_TOKEN_ADDRESS");
        uint256 deployerKey = vm.envUint("ARC_PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        CasibInvoiceEscrow escrow = new CasibInvoiceEscrow(usdcToken);

        console.log("CasibInvoiceEscrow deployed at:", address(escrow));
        console.log("USDC token address:", usdcToken);

        vm.stopBroadcast();
    }
}
