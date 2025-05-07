// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Errors {
    error InvalidEthermax();
    error InvalidHashrate();
    error InvalidPowerConsumption();
    error InvalidCost();
    error InvalidMaxMiners();
    error InvalidTotalPowerOutput();
    error InvalidCoordinates();
    error InvalidMiner();
    error InvalidFacility();
    error MiningInProgress();
    error MiningNotStarted();
    error InvalidAmount();
    error FacilityFull();
    error InsufficientPower();
    error InvalidMinerIndex();
    error InvalidFacilityIndex();
    error InvalidFee();
    error NonExistentMiner();
    error NonExistentFacility();
    error CantModifyStarterMiner();
    error CantModifyStarterFacility();
    error WithdrawFailed();
    error IncorrectValue();
    error AlreadyPurchasedInitialFactory();
    error InvalidReferrer();
    error StarterMinerAlreadyAcquired();
    error InvalidMinerCoordinates();
    error FacilityInadequatePowerOutput();
    error MinerNotInProduction();
    error TooPoor();
    error PlayerDoesNotOwnMiner();
    error GreatDepression();
    error NeedToInitializeFacility();
    error AlreadyAtMaxFacility();
    error CantBuyNewFacilityYet();
    error NewFacilityNotInProduction();
    error NoRewardsPending();
    error MiningHasntStarted();
    error FacilityDimensionsInvalid();
    error InvalidPowerOutput();
} 