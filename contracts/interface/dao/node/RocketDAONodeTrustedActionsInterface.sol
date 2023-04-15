pragma solidity >0.5.0 <0.9.0;

// SPDX-License-Identifier: GPL-3.0-only

interface RocketDAONodeTrustedActionsInterface {
    function actionJoin() external;
    function actionJoinRequired(address _nodeAddress) external;
    function actionLeave() external;
    function actionKick(address _nodeAddress) external;
    function actionChallengeMake(address _nodeAddress) external payable;
    function actionChallengeDecide(address _nodeAddress) external;
}
