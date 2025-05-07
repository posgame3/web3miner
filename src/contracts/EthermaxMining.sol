// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSetLib} from "solady/src/utils/EnumerableSetLib.sol";
import {FixedPointMathLib} from "solady/src/utils/FixedPointMathLib.sol";

import {IEthermax} from "./interfaces/IEthermax.sol";

import {Miner} from "./types/Miner.sol";
import {Facility} from "./types/Facility.sol";
import {NewFacility} from "./types/NewFacility.sol";

import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";

// Ethermax main contract
contract EthermaxMining is Ownable {
    using EnumerableSetLib for EnumerableSetLib.Uint256Set;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //            STORAGE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// @dev Ethermax token address.
    address public etherMax;

    /// @dev Dekalit Rektoshi fee recipient.
    address public dekalitRektoshi;

    /// @dev Mining start block.
    uint256 public startBlock;
    bool public miningHasStarted;

    // every miner has an id
    uint256 universalMinerId;

    /// @dev Total unique miners.
    uint256 public uniqueMinerCount;

    /// @dev Total facilities.
    uint256 public facilityCount;

    /// @dev Tracks last time we updated rewards.
    uint256 public lastRewardBlock;

    /// @dev Total network hashrate.
    uint256 public totalHashrate;

    /// @dev Tracks Ethermax per single hash.
    uint256 public cumulativeEthermaxPerHash;

    /// @dev Initial cooldown time is 24H.
    uint256 public cooldown = 24 hours;

    /// @dev Initial referral fee is 2.5%.
    uint256 public referralFee = 0.025e18;

    /// @dev Initial burn is 75%.
    uint256 public burnPct = 0.75e18;

    /// @dev Players total hashrate.
    mapping(address => uint256) public playerHashrate;

    /// @dev Players pending rewards.
    mapping(address => uint256) public playerPendingRewards;

    /// @dev Players debt (updated after rewards are updated for a player).
    mapping(address => uint256) public playerEthermaxDebt;

    /// @dev Tracks different miners and its stats.
    mapping(uint256 => Miner) public miners;

    /// @dev Tracks different facilities and its stats.
    mapping(uint256 => NewFacility) public facilities;

    /// @dev Tracks how many of each miner a player has. Only tracks Id.
    mapping(address => EnumerableSetLib.Uint256Set) public playerMinersOwned;

    /// @dev Maps minerId to the actual miner struct
    mapping(uint256 => Miner) public playerMinersId;

    /// @dev Tracks players facility stats.
    mapping(address => Facility) public ownerToFacility;

    /// @dev Tracks new players initializing in the game.
    mapping(address => bool) public initializedStarterFacility;

    /// @dev Tracks if a player has acquired a free miner.
    mapping(address => bool) public acquiredStarterMiner;

    /// @dev Tracks if a there's a secondary market for a certain miner.
    mapping(uint256 => uint256) public minerSecondHandMarket;

    /// @dev Tracks each miners coords for a player
    mapping(address => mapping(uint256 => mapping(uint256 => bool))) public playerOccupiedCoords;

    mapping(address => uint256) public lastFacilityUpgradeTimestamp;

    /// @dev Tracks referrals.
    mapping(address => address) public referrals;

    /// @dev Tracks referred users.
    mapping(address => address[]) public referredUsers;

    /// @dev Track how much each referrer got paid.
    mapping(address => uint256) public referralBonusPaid;

    /// @dev Tracks the facility fee for each facility
    mapping(uint256 => uint256) public facilityFees;

    /// @dev Address of the facility fee recipient
    address public facilityFeeRecipient;

    /// @dev Purchasing initial facility price in ETH.
    uint256 public initialFacilityPrice = 0.01 ether;

    /// @dev start miner and facility index (these will never change since every player starts with same facility).
    uint256 public immutable STARTER_MINER_INDEX;
    uint256 public immutable STARTER_FACILITY_INDEX;

    /// @dev Halvening every 1,296,000 blocks, about 30 days
    uint256 public constant HALVING_INTERVAL = 1_296_000;

    /// @dev Initial Ethermax per block
    uint256 public constant INITIAL_ETHERMAX_PER_BLOCK = 50e18; // 50 Ethermax per block

    uint256 public constant REWARDS_PRECISION = 1e18;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //          CONSTRUCTOR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    constructor() Ownable(msg.sender) {
        STARTER_MINER_INDEX = ++uniqueMinerCount;

        // add starter free miner
        miners[STARTER_MINER_INDEX] = Miner(
            STARTER_MINER_INDEX,
            type(uint256).max,
            type(uint256).max,
            type(uint256).max,
            100,
            1,
            type(uint256).max, // this is the free starter miner, people cannot buy it
            false
        );

        // add starter facility
        facilities[++facilityCount] = NewFacility(
            4,
            28,
            type(uint256).max, // starter facility, people cannot buy it
            false,
            2,
            2
        );

        STARTER_FACILITY_INDEX = facilityCount;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //        USER FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * @dev All new players must purchase an initial facility with ETH.
     *
     * Players can only purchase new facilities after acquiring initial Facility.
     */
    function purchaseInitialFacility(address referrer) external payable {
        if (msg.value != initialFacilityPrice) {
            revert Errors.IncorrectValue();
        }

        if (initializedStarterFacility[msg.sender]) {
            revert Errors.AlreadyPurchasedInitialFactory();
        }

        if (referrer == msg.sender) {
            revert Errors.InvalidReferrer();
        }

        initializedStarterFacility[msg.sender] = true;

        if (referrer != address(0)) {
            referrals[msg.sender] = referrer;
            referredUsers[referrer].push(msg.sender);
        }

        NewFacility memory newFacility = facilities[STARTER_FACILITY_INDEX];
        Facility storage facility = ownerToFacility[msg.sender];

        // initialize players starter facility
        facility.facilityIndex = STARTER_FACILITY_INDEX;
        facility.maxMiners = newFacility.maxMiners;
        facility.totalPowerOutput = newFacility.totalPowerOutput;
        facility.x = newFacility.x;
        facility.y = newFacility.y;

        emit Events.InitialFacilityPurchased(msg.sender);
    }

    /**
     * @dev All new players can redeem 1 free miner.
     *
     * Players are not required to redeem a free miner.
     */
    function getFreeStarterMiner(uint256 x, uint256 y) external {
        if (acquiredStarterMiner[msg.sender]) {
            revert Errors.StarterMinerAlreadyAcquired();
        }

        acquiredStarterMiner[msg.sender] = true;

        Miner memory miner = miners[STARTER_MINER_INDEX];
        Facility storage facility = ownerToFacility[msg.sender];

        if (_isInvalidCoordinates(x, y, facility.x, facility.y)) {
            revert Errors.InvalidMinerCoordinates();
        }

        if (facility.currPowerOutput + miner.powerConsumption > facility.totalPowerOutput) {
            revert Errors.FacilityInadequatePowerOutput();
        }

        miner.x = x;
        miner.y = y;
        miner.id = ++universalMinerId;
        playerOccupiedCoords[msg.sender][x][y] = true;

        playerMinersOwned[msg.sender].add(universalMinerId);
        playerMinersId[universalMinerId] = miner;

        // increase facility miners
        facility.currMiners++;

        // increase power consumption from factory
        facility.currPowerOutput += miner.powerConsumption;

        // emit Events.FreeMinerRedeemed(msg.sender);
        emit Events.MinerBought(msg.sender, STARTER_MINER_INDEX, 0, universalMinerId, x, y);

        _increaseHashrate(msg.sender, miner.hashrate);
    }

    /**
     * @dev Purchase new miners using Ethermax.
     */
    function buyMiner(uint256 minerIndex, uint256 x, uint256 y) external {
        // check user has enough funds for miner and facility allows it
        Miner memory miner = miners[minerIndex];
        Facility storage facility = ownerToFacility[msg.sender];

        if (_isInvalidCoordinates(x, y, facility.x, facility.y)) {
            revert Errors.InvalidMinerCoordinates();
        }

        // this case will cover if an index too large is passed in
        if (!miner.inProduction) revert Errors.MinerNotInProduction();

        if (IEthermax(etherMax).balanceOf(msg.sender) < miner.cost) {
            revert Errors.TooPoor();
        }

        if (facility.currPowerOutput + miner.powerConsumption > facility.totalPowerOutput) {
            revert Errors.FacilityInadequatePowerOutput();
        }

        // transfer correct amt of Ethermax
        IEthermax(etherMax).transferFrom(msg.sender, address(this), miner.cost);

        // burn
        IEthermax(etherMax).burn(FixedPointMathLib.mulWad(miner.cost, burnPct));

        miner.x = x;
        miner.y = y;
        miner.id = ++universalMinerId;
        playerOccupiedCoords[msg.sender][x][y] = true;

        playerMinersOwned[msg.sender].add(universalMinerId);
        playerMinersId[universalMinerId] = miner;

        // increase facility miners
        facility.currMiners++;

        // increase power consumption from factory
        facility.currPowerOutput += miner.powerConsumption;

        emit Events.MinerBought(msg.sender, minerIndex, miner.cost, universalMinerId, x, y);

        _increaseHashrate(msg.sender, miner.hashrate);
    }

    /**
     * @dev Sell miners, if there's a secondary market, player will get Ethermax in return.
     *
     * Players will sell miners in the case they run out of spots in their facility to put new miners.
     */
    function sellMiner(uint256 minerId) external {
        if (!playerMinersOwned[msg.sender].contains(minerId)) {
            revert Errors.PlayerDoesNotOwnMiner();
        }

        Miner memory miner = playerMinersId[minerId];
        Facility storage facility = ownerToFacility[msg.sender];

        uint256 secondHandPrice = minerSecondHandMarket[miner.minerIndex];

        // if there's not enough Ethermax in this contract to pay out, revert
        if (secondHandPrice > IEthermax(etherMax).balanceOf(address(this))) {
            revert Errors.GreatDepression();
        }

        // decrease facility miners
        facility.currMiners--;

        // decrease power consumption from factory
        facility.currPowerOutput -= miner.powerConsumption;

        playerMinersOwned[msg.sender].remove(minerId);
        delete playerMinersId[minerId];
        playerOccupiedCoords[msg.sender][miner.x][miner.y] = false;

        emit Events.MinerSold(msg.sender, miner.minerIndex, secondHandPrice, minerId, miner.x, miner.y);

        _decreaseHashrate(msg.sender, miner.hashrate);

        if (secondHandPrice > 0) {
            IEthermax(etherMax).transfer(msg.sender, secondHandPrice);
        }
    }

    /**
     * @dev Purchase larger or more power output facility.
     *
     * Players must linearly climb the facilities.
     */
    function buyNewFacility() external {
        // need to purchase initial facility first
        if (!initializedStarterFacility[msg.sender]) {
            revert Errors.NeedToInitializeFacility();
        }

        Facility storage currFacility = ownerToFacility[msg.sender];
        uint256 currFacilityIndex = currFacility.facilityIndex;

        if (currFacilityIndex == facilityCount) {
            revert Errors.AlreadyAtMaxFacility();
        }

        // 24H cooldown between each facility upgrade
        if (block.timestamp - lastFacilityUpgradeTimestamp[msg.sender] < cooldown) {
            revert Errors.CantBuyNewFacilityYet();
        }

        NewFacility memory newFacility = facilities[currFacilityIndex + 1];

        if (!newFacility.inProduction) {
            revert Errors.NewFacilityNotInProduction();
        }

        if (IEthermax(etherMax).balanceOf(msg.sender) < newFacility.cost) {
            revert Errors.TooPoor();
        }

        IEthermax(etherMax).transferFrom(msg.sender, address(this), newFacility.cost);

        // burn
        IEthermax(etherMax).burn(FixedPointMathLib.mulWad(newFacility.cost, burnPct));

        currFacility.facilityIndex++;
        currFacility.maxMiners = newFacility.maxMiners;
        currFacility.totalPowerOutput = newFacility.totalPowerOutput;
        currFacility.x = newFacility.x;
        currFacility.y = newFacility.y;

        lastFacilityUpgradeTimestamp[msg.sender] = block.timestamp;

        emit Events.FacilityBought(msg.sender, currFacility.facilityIndex, newFacility.cost);
    }

    /**
     * @dev Claim rewards for player.
     */
    function claimRewards() external {
        _updateRewards(msg.sender);

        uint256 rewards = playerPendingRewards[msg.sender];
        if (rewards == 0) {
            revert Errors.NoRewardsPending();
        }
        Facility storage currFacility = ownerToFacility[msg.sender];
        uint256 currFacilityIndex = currFacility.facilityIndex;

        playerPendingRewards[msg.sender] = 0;

        // referral bonus
        uint256 referralBonus = FixedPointMathLib.mulWad(rewards, referralFee);
        uint256 finalRewards = rewards - referralBonus;

        // facility fee
        uint256 facilityFee = FixedPointMathLib.mulWad(finalRewards, facilityFees[currFacilityIndex]);
        finalRewards -= facilityFee;
        
        IEthermax(etherMax).mint(facilityFeeRecipient, facilityFee);

        IEthermax(etherMax).mint(msg.sender, finalRewards);

        address referrer = referrals[msg.sender];
        if (referrer != address(0)) {
            IEthermax(etherMax).mint(referrer, referralBonus);
            referralBonusPaid[referrer] += referralBonus;
        } else {
            // else mint referral fee to this contract
            IEthermax(etherMax).mint(address(this), referralBonus);
            referralBonusPaid[address(this)] += referralBonus;
        }

        emit Events.RewardsClaimed(msg.sender, rewards);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //       INTERNAL FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * @dev Update global cumulative rewards before game state changes.
     */
    function _updateCumulativeRewards() internal {
        if (totalHashrate == 0) {
            lastRewardBlock = block.number;
            return;
        }

        // if we have not updated rewards and a halvening occurs, we must add the different
        // Ethermax emissions per halvening
        uint256 currentBlock = lastRewardBlock;
        uint256 lastEthermaxPerBlock =
            INITIAL_ETHERMAX_PER_BLOCK / (2 ** ((lastRewardBlock - startBlock) / HALVING_INTERVAL));

        while (currentBlock < block.number) {
            uint256 nextHalvingBlock =
                (startBlock % HALVING_INTERVAL) + ((currentBlock / HALVING_INTERVAL) + 1) * HALVING_INTERVAL;
            uint256 endBlock = (nextHalvingBlock < block.number) ? nextHalvingBlock : block.number;

            // apply correct emission rate for this segment
            cumulativeEthermaxPerHash +=
                ((lastEthermaxPerBlock * (endBlock - currentBlock) * REWARDS_PRECISION) / totalHashrate);

            // move to next segment
            currentBlock = endBlock;

            // if a halving has happened, apply the new rate
            if (currentBlock == nextHalvingBlock) {
                lastEthermaxPerBlock /= 2;
            }
        }

        lastRewardBlock = block.number;
    }

    function _updateRewards(address player) internal {
        _updateCumulativeRewards();

        playerPendingRewards[player] +=
            (playerHashrate[player] * (cumulativeEthermaxPerHash - playerEthermaxDebt[player])) / REWARDS_PRECISION;

        playerEthermaxDebt[player] = cumulativeEthermaxPerHash;
    }

    /**
     * @dev Increase players hashrate.
     */
    function _increaseHashrate(address player, uint256 hashrate) internal {
        // only start rewarding Ethermax per block when the first miner is added
        if (!miningHasStarted) {
            miningHasStarted = true;
            startBlock = block.number;
            lastRewardBlock = block.number;

            emit Events.MiningStarted(startBlock);
        }

        // update rewards and global state before modifying players state
        _updateRewards(player);

        totalHashrate += hashrate;
        playerHashrate[player] += hashrate;

        emit Events.PlayerHashrateIncreased(msg.sender, playerHashrate[player], playerPendingRewards[player]);
    }

    /**
     * @dev Decrease players hashrate.
     */
    function _decreaseHashrate(address player, uint256 hashrate) internal {
        // update rewards and global state before modifying players state
        _updateRewards(player);

        totalHashrate -= hashrate;
        playerHashrate[player] -= hashrate;

        emit Events.PlayerHashrateDecreased(msg.sender, playerHashrate[player], playerPendingRewards[player]);
    }

    /**
     * @dev checks the miners x,y coords are within bounds and there isn't an existent miner at that position.
     */
    function _isInvalidCoordinates(uint256 desiredX, uint256 desiredY, uint256 facilityX, uint256 facilityY)
        internal
        view
        returns (bool)
    {
        if (desiredX >= facilityX || desiredY >= facilityY) {
            return true;
        }

        return playerOccupiedCoords[msg.sender][desiredX][desiredY];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //         VIEW FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * @dev Get the current mining emission rate based on halvings
     */
    function getEthermaxPerBlock() public view returns (uint256) {
        if (!miningHasStarted) {
            return 0;
        }

        uint256 halvingsSinceStart = (block.number - startBlock) / HALVING_INTERVAL;

        return INITIAL_ETHERMAX_PER_BLOCK / (2 ** halvingsSinceStart);
    }

    /**
     * @dev Get current pending rewards for player.
     */
    function pendingRewards(address player) external view returns (uint256) {
        // below is basically the same logic as _updateCumulativeRewards() but doesnt change state
        if (!miningHasStarted) {
            return 0;
        }

        if (totalHashrate == 0) {
            return FixedPointMathLib.mulWad(playerPendingRewards[player], 1e18 - referralFee);
        }

        uint256 currentBlock = lastRewardBlock;
        uint256 lastEthermaxPerBlock =
            INITIAL_ETHERMAX_PER_BLOCK / (2 ** ((lastRewardBlock - startBlock) / HALVING_INTERVAL));

        uint256 simulatedCumulativeEthermaxPerHash = cumulativeEthermaxPerHash;

        while (currentBlock < block.number) {
            uint256 nextHalvingBlock =
                (startBlock % HALVING_INTERVAL) + ((currentBlock / HALVING_INTERVAL) + 1) * HALVING_INTERVAL;
            uint256 endBlock = (nextHalvingBlock < block.number) ? nextHalvingBlock : block.number;

            // simulate rewards accumulation
            if (totalHashrate > 0) {
                simulatedCumulativeEthermaxPerHash +=
                    ((lastEthermaxPerBlock * (endBlock - currentBlock) * REWARDS_PRECISION) / totalHashrate);
            }

            // move to next segment
            currentBlock = endBlock;

            // if we reached a halving point, apply the new emission rate
            if (currentBlock == nextHalvingBlock) {
                lastEthermaxPerBlock /= 2;
            }
        }

        return FixedPointMathLib.mulWad(
            playerPendingRewards[player]
                + (
                    (playerHashrate[player] * (simulatedCumulativeEthermaxPerHash - playerEthermaxDebt[player]))
                        / REWARDS_PRECISION
                ),
            1e18 - referralFee
        );
    }

    /**
     * @dev Get current Ethermax a player mines per block.
     */
    function playerEthermaxPerBlock(address player) external view returns (uint256) {
        if (totalHashrate == 0) {
            return 0; // Prevent division by zero
        }

        uint256 currEthermaxPerBlock =
            INITIAL_ETHERMAX_PER_BLOCK / (2 ** ((block.number - startBlock) / HALVING_INTERVAL));

        return FixedPointMathLib.mulDiv(playerHashrate[player], currEthermaxPerBlock, totalHashrate);
    }

    /**
     * @dev Get blocks till next halvening.
     */
    function blocksUntilNextHalving() external view returns (uint256) {
        if (startBlock == 0) revert Errors.MiningHasntStarted();

        uint256 nextHalvingBlock =
            (startBlock % HALVING_INTERVAL) + ((block.number / HALVING_INTERVAL) + 1) * HALVING_INTERVAL;

        return nextHalvingBlock - block.number;
    }

    /**
     * @dev Get next available facility upgrade time.
     */
    function timeUntilNextFacilityUpgrade(address player) external view returns (uint256) {
        if (lastFacilityUpgradeTimestamp[player] + cooldown < block.timestamp) {
            return 0;
        }

        return (lastFacilityUpgradeTimestamp[player] + cooldown) - block.timestamp;
    }

    /**
     * @dev Get all miners for a player.
     */
    function getPlayerMinersPaginated(address player, uint256 startIndex, uint256 size)
        external
        view
        returns (Miner[] memory)
    {
        EnumerableSetLib.Uint256Set storage set = playerMinersOwned[player];
        uint256 length = set.length();

        // Return empty array if start index is beyond array bounds
        if (startIndex >= length) {
            return new Miner[](0);
        }

        // Calculate how many items we can actually return
        uint256 remaining = length - startIndex;
        uint256 returnSize = size > remaining ? remaining : size;

        Miner[] memory playerMiners = new Miner[](returnSize);
        for (uint256 i = 0; i < returnSize; i++) {
            playerMiners[i] = playerMinersId[set.at(startIndex + i)];
        }

        return playerMiners;
    }

    /**
     * @dev Get all referred users.
     */
    function getReferrals(address referrer) external view returns (address[] memory) {
        return referredUsers[referrer];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //        OWNER FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * @dev Add new miner to game.
     */
    function addMiner(uint256 hashrate, uint256 powerConsumption, uint256 cost, bool inProduction) external onlyOwner {
        // must increment first cause compiler evaluates function arg before evaluating the assignment
        ++uniqueMinerCount;
        miners[uniqueMinerCount] = Miner(uniqueMinerCount, 0, 0, 0, hashrate, powerConsumption, cost, inProduction);

        emit Events.NewMinerAdded(uniqueMinerCount, hashrate, powerConsumption, cost, inProduction);
    }

    /**
     * @dev Allows or prevents miner from being purchased.
     *
     * Miners cannot be removed, only toggled off from purchased.
     */
    function toggleMinerProduction(uint256 minerIndex, bool inProduction) external onlyOwner {
        if (minerIndex < STARTER_MINER_INDEX || minerIndex > uniqueMinerCount) {
            revert Errors.InvalidMinerIndex();
        }
        Miner storage miner = miners[minerIndex];
        miner.inProduction = inProduction;

        emit Events.MinerProductionToggled(minerIndex, inProduction);
    }

    /**
     * @dev Add new facility to game.
     */
    function addFacility(
        uint256 maxMiners,
        uint256 totalPowerOutput,
        uint256 cost,
        bool inProduction,
        uint256 x,
        uint256 y
    ) external onlyOwner {
        if (x * y != maxMiners) {
            revert Errors.FacilityDimensionsInvalid();
        }

        if (facilities[facilityCount].x > x || facilities[facilityCount].y > y) {
            revert Errors.FacilityDimensionsInvalid();
        }

        if (facilities[facilityCount].totalPowerOutput > totalPowerOutput) {
            revert Errors.InvalidPowerOutput();
        }

        facilities[++facilityCount] = NewFacility(maxMiners, totalPowerOutput, cost, inProduction, x, y);

        emit Events.NewFacilityAdded(facilityCount, totalPowerOutput, cost, inProduction, x, y);
    }

    /**
     * @dev Allows or prevents new facilities from being purchased.
     *
     * New facilities cannot be removed, only toggled off from purchased.
     */
    function toggleFacilityProduction(uint256 facilityIndex, bool inProduction) external onlyOwner {
        if (facilityIndex < STARTER_FACILITY_INDEX || facilityIndex > facilityCount) {
            revert Errors.InvalidFacilityIndex();
        }

        NewFacility storage facility = facilities[facilityIndex];
        facility.inProduction = inProduction;

        emit Events.FacilityProductionToggled(facilityIndex, inProduction);
    }

    /**
     * @dev Add secondary market for a miner.
     */
    function addSecondaryMarketForMiner(uint256 minerIndex, uint256 price) external onlyOwner {
        minerSecondHandMarket[minerIndex] = price;

        emit Events.MinerSecondaryMarketAdded(minerIndex, price);
    }

    function setEthermax(address _etherMax) external onlyOwner {
        etherMax = _etherMax;
    }

    function setDekalitRektoshi(address _dekalitRektoshi) external onlyOwner {
        dekalitRektoshi = _dekalitRektoshi;
    }

    function setInitialFacilityPrice(uint256 _initialPrice) external onlyOwner {
        initialFacilityPrice = _initialPrice;
    }

    function setReferralFee(uint256 fee) external onlyOwner {
        if (fee > 1e18) revert Errors.InvalidFee();

        referralFee = fee;
    }

    function setBurnPct(uint256 burn) external onlyOwner {
        if (burn > 1e18) revert Errors.InvalidFee();

        burnPct = burn;
    }

    function setCooldown(uint256 _cooldown) external onlyOwner {
        cooldown = _cooldown;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success,) = payable(dekalitRektoshi).call{value: balance}("");

        if (!success) revert Errors.WithdrawFailed();
    }

    function withdrawEthermax(uint256 amt) external onlyOwner {
        IEthermax(etherMax).transfer(dekalitRektoshi, amt);
    }

    function changeMinerCost(uint256 minerIndex, uint256 newCost) external onlyOwner {
        if (minerIndex > uniqueMinerCount) {
            revert Errors.NonExistentMiner();
        }

        if (minerIndex == STARTER_MINER_INDEX) {
            revert Errors.CantModifyStarterMiner();
        }

        Miner storage miner = miners[minerIndex];

        miner.cost = newCost;

        emit Events.MinerCostChanged(minerIndex, newCost);
    }

    function changeFacilityCost(uint256 facilityIndex, uint256 newCost) external onlyOwner {
        if (facilityIndex > facilityCount) {
            revert Errors.NonExistentFacility();
        }

        if (facilityIndex == STARTER_FACILITY_INDEX) {
            revert Errors.CantModifyStarterFacility();
        }

        NewFacility storage facility = facilities[facilityIndex];

        facility.cost = newCost;

        emit Events.FacilityCostChanged(facilityIndex, newCost);
    }

    function setFacilityFeeRecipient(address _facilityFeeRecipient) external onlyOwner {
        facilityFeeRecipient = _facilityFeeRecipient;
    }

    function setFacilityFee(uint256 facilityIndex, uint256 fee) external onlyOwner {
        facilityFees[facilityIndex] = fee;
    }
}