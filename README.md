# BoxCars Experimental Ethereum Dice Game

This is an experimental contract to test:
* Multi player gaming
* 'pre-commitment' mechanism for using the blockhash for randomness
* 'fractional risk' for blockhash compromise, where an attacker has only a small chance of mining a winning block


## Purpose
this is a test is get community feedback on the method, with an eye to using it for roleplaying 
and board game style games.

## How it Works
The contract to run a simple pre-commitment dice game, where players bet at even odds
whether they can roll a 'double six' in 19 'rolls'.  Each roll is a personalised random roll 
based on the block hash and the player address.  Players bet using 'placeBet' and must collect
their winnings within 255 blocks (approximately one hour) using 'resolveBet'.

## Contract
The contract is available at [https://github.com/etherboxcars/BoxCars].

