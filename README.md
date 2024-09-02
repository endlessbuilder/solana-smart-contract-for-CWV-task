## Solana smart contract for CWV task

###CATWIFVIEW   

Tech Specs:  

Abstract:  

CATWIFVIEW (CWV) will be launching a token based on the CATWIFVIEW project team guidelines.  The launch is made up of two parts. The first part is the launch of a related pump.fun token (TOKEN A) which will then be used to play a game where the pump.fun token holder can trade in their token for CWV tokens based on a random multiplier.  The pump.fun tokens will be held in a Solana smart contract and transferred based on owners instructions.  

This launch requires two components.  

A simple Solana Smart Contract to Swap TokenA with the following attributes.  
  Owned and Administered by CWV Treasury Wallet  
  Will accept a token for swap based on token CA (can be changed)  
  Will send back a number of CWV based on the confirmed multiplier.  
  Will hold the pump.fun token in the smart contract or be sent to an address approved by the contract owner, the CWV Treasury Wallet.  
  Will accept the CWV token to be used as the “bank” for the swap.  
  The multiplier will need to be confirmed somehow from the front end to avoid cheating.  
  
A simple web3 frontend game.  
  User logins with Solana Wallet  
  User sends in XX amount of Token A  
  Game Starts  
  User clicks on screen to scratch in litterbox.  
  Random changes for winner or loser on each turn.  
  At end of 5 turns, the number of winning turns is used as the token multiplier.  
  Player may win up to 5X their token.   
  CWV tokens are sent by the smart contract to the user’s wallet.  
  The game keeps a dashboard visible on the screen containing the smart contract stats.  

The Smart contract should keep track of the following:  
	Number of games played  
	Number of each multiple paid out.  (1X, 2X, 3X, 4X)  
	Amount of Token A inside the contract  
	Amount of CWV inside the contract  
	Amount of CWV paid out.  
So that a small dashboard can show the contract details in realtime.  
