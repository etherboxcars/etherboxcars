

abi = JSON.parse('[{"constant":true,"inputs":[],"name":"getMaximumBet","outputs":[{"name":"max","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"blockNumber","type":"uint256"}],"name":"displayDiceRoll","outputs":[{"name":"","type":"uint8[2]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getBankroll","outputs":[{"name":"bankroll","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"blockNumber","type":"uint256"},{"name":"player","type":"address"}],"name":"getDiceRoll","outputs":[{"name":"roll","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"player","type":"address"}],"name":"playerHasBet","outputs":[{"name":"active","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"listPlayers","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMinimumBet","outputs":[{"name":"min","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"cleanupOldBets","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"resolveBet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"houseBankroll","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"roll","type":"uint8"}],"name":"translateDiceRoll","outputs":[{"name":"","type":"uint8[2]"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"reset","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"topUp","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"placeBet","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"blockNumber","type":"uint256"}],"name":"LogBetMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"blockNumber","type":"uint256"}],"name":"LogBetWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"blockNumber","type":"uint256"}],"name":"LogBetLost","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LogFallback","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LogTopUp","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LogPayment","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"string"}],"name":"LogMessage","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"string"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogMessage","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"string"},{"indexed":false,"name":"player","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogMessage","type":"event"}]')

var boxCarsContract, contractAddress;

balanceWei = -1;
balanceEth = -1;
number = -1;

// track a bet
betRunning = false;
startBlock = 0;
currentBlock = 0;
gameWon = false;

// check if live on mainnet
onMainNet = false;

window.addEventListener('load', function() {
	
	ipLookUp()
	
	$("#finalize_div").hide();

  	if (typeof web3 !== 'undefined') 						// Checking if Web3 has been injected by the browser (Mist/MetaMask)
	{						
    	web3 = new Web3(web3.currentProvider); 				// use injected provider
    	console.log("loaded injected web3");
	}
  	else  													// or try to bootstrap for testing?
  	{
    	console.log('No web3 - you should consider using MetaMask');
    	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545")); // truffle develop is 9545, Ganache is 7545
    	console.log('manually starting web provider using rpc to 7545');
  	}
    
	web3.version.getNetwork((err, netId) => {						// contract address is different on every network; setup correctly for each network
	
	  	switch (netId) 
		{
	    	case "1":
	      		console.log('Using mainnet')  						// TODO: set contract address on mainnet, set up account
				onMainNet = true;
	      		break
			case "3":
		    	console.log('This is the ropsten test network.')	// TODO: set contract address on testnet, set up account
		      	break
		    case "4447":		
				console.log('using truffle internal testnet')
				break
		    case "5777":    										// ganache local network 
		      	console.log('Using a local test network.')
          		contractAddress = '0xc382b554f71bef2c52d83e977e45f62c4a03d4a6';  // deployed contract test address... 
	      		break
	    	default:
	            console.error('UNKNOWN NETWORK ' + netId + ' - CANNOT SET NETWORK AND CONTRACT ADDRESS IN index.js');
		}
		
		BoxCarsContractABI = web3.eth.contract(abi);				
		boxCarsContract = BoxCarsContractABI.at(contractAddress);
  		setAccountDetailsInHTML(web3.eth.accounts[0])

		web3.eth.getBlock("latest", function(error, block) {
			if(!error) 
				refreshBlockData(block);
			else
				console.log("error in startup data read");
		})	
		
		listenForNewBlocks(boxCarsContract);
	})
})

/**
 *  A rough and ready check to try to keep Aussies away from the website
 */
function ipLookUp () {
	$.ajax('http://ip-api.com/json')
		.then(
		function success(response) {
			console.log('User\'s Country Code', response.countryCode);
		
			if (onMainNet && response.countryCode == "AU")			// punt Aussies away from production website...
				window.location.replace("blocked.html");	
		},
		
		function fail(data, status) {
			console.log('Request failed.  Returned status of', status);
		}
	);
}

function listenForNewBlocks(boxCarsContract)
{
	var filter = web3.eth.filter('latest');
	filter.watch(function(error, blockhash) {
		if(!error) 
			refreshData(blockhash);	// nb: result is the blockhash 
		else
		    console.error("tracking error; " + error);
	});
}

/**
*		takes the latest block hash and gets the block 
*       (seems a little clumsy, but can't figure out how to read a block directly in listenForNewBlocks?)
*/
function refreshData(blockHash)
{	
	web3.eth.getBlock(blockHash, function(error, block) {
		if(!error) 
	  	  	refreshBlockData(block);		 
		else
		    console.error("refreshdata error; " + error);
    });
}

/**
 *  This is the main loop, that gets run every time a new block is mined
 *  @param {result} the block hash of the recetly mined block (=="latest")
 */
function refreshBlockData(block)
{
	setAccountDetailsInHTML(web3.eth.accounts[0]);  
	setHouseData();

	currentBlock = block.number;
    console.log("New block: "+currentBlock + " bet? " + betRunning);
    console.log(JSON.stringify(block, null, 4));

	$('#block').html(block.number); 

	$('#rolls').html("start block: " + currentBlock + "<br>");	
	$('#roll_history').html("");
	
	boxCarsContract.playerHasBet(web3.eth.accounts[0], {from: web3.eth.accounts[0]}, function(error, result) 
	{
		if (!error) 
		{
			if (result == true)
			{
				//alert("player has a bet !");
				var endBlock = (currentBlock>startBlock+18)?(startBlock+18):currentBlock;
				console.log("endBlock = " + endBlock + " currentBlock = " + currentBlock + " start block = " + startBlock);
				
				for (var i=endBlock; i>=startBlock; i--)
					processDiceRollDuringBet(i, endBlock-i);
				
			}	
			else
			{
				//alert("player does *not* have a bet !");
				for (var i=0; i < 144; i++) 
				{
					var blockNo = block.number - i;
					processDiceRollForBlock(blockNo, i);
				} 
			}	
		} 
		else 
		{
			console.error('LOR Loop: ' + error);
		}		
	});
/*	
	if (betRunning)  // only display the rolls for the current bet...
	{
		var endBlock = (currentBlock>startBlock+18)?(startBlock+18):currentBlock;
		console.log("endBlock = " + endBlock + " currentBlock = " + currentBlock + " start block = " + startBlock);
		
		for (var i=endBlock; i>=startBlock; i--)
			processDiceRollDuringBet(i, endBlock-i);
	}
	else for (var i=0; i < 144; i++) 
	{
		var blockNo = block.number - i;
		processDiceRollForBlock(blockNo, i);
	} 
*/	
}

/**
*  gets the dice roll for a particular block from the contract
*  - this is a bit messy, as I need to update the html within the asynch method... so this is a fairly busy method
*  @param blockNumber the number of the block to read the dice roll for
*  @param loopNumber the position of this roll in the display loop (used for formatting)
*/
function processDiceRollDuringBet(blockNumber, loopNumber)
{
	let blockNo = blockNumber;
	let pos = loopNumber;
	boxCarsContract.getDiceRoll(blockNo, web3.eth.accounts[0], {from: web3.eth.accounts[0]}, function(error, result) 
	{
		if (!error) 
		{
			let roll = getDiceRollString(result);
			
			console.log("block: " + blockNumber + " loop: " + loopNumber + " roll: " + roll);
			
			$('#rolls').append("<span style='font-size:32px'>" + roll + "</span></font>"); 
			$('#roll_history').append( roll + " "); 
			if (pos == 0)
				$('#current_roll').html("roll: " + getDiceRollString(result, true));
			if (betRunning && roll == 36)
			{
				console.alert("winning bet - press 'finalise' to collect.");
				gameWon = true;
				$("#roll_header").html("Game Won! (pending chain confirmation)");
			}	
		} 
		else 
		{
			console.error('LOR Loop: ' + error);
		}
	});	
}

/**
*  gets the dice roll for a particular block from the contract
*  - this is a bit messy, as I need to update the html within the asynch method... so this is a fairly busy method
*  @param blockNumber the number of the block to read the dice roll for
*  @param loopNumber the position of this roll in the display loop (used for formatting)
*/
function processDiceRollForBlock(blockNumber, loopNumber)
{
	let blockNo = blockNumber;
	let pos = loopNumber;
	boxCarsContract.getDiceRoll(blockNo, web3.eth.accounts[0], {from: web3.eth.accounts[0]}, function(error, result) 
	{
		if (!error) 
		{
			let roll = getDiceRollString(result);
			if (pos < 72) $('#rolls').append(roll); 
			$('#roll_history').append( roll + " "); 
		} 
		else 
		{
			console.error('LOR Loop: ' + error);
		}
	});	
}


function getDiceRollString(roll, showDiceSymbols = false)
{
	let dice1 = 1 + Math.floor((roll-1) / 6);
	let dice2 = 1 + (roll-1) % 6

    if (roll == 36) return " <span class='win'>" + getDiceSymbol(6) + "," + getDiceSymbol(6) + "</span>";
	return " " + getDiceSymbol(dice1, showDiceSymbols) + "," + getDiceSymbol(dice2, showDiceSymbols);
}

function getDiceSymbol(number, showDiceSymbols = false)
{
    if (showDiceSymbols == false)
		return number;

	switch (number) {
	    case 1: return "&#9856;";
	    case 2: return "&#9857;";
	    case 3: return "&#9858;";
	    case 4: return "&#9859;";
	    case 5: return "&#9860;";
	    case 6: return "&#9861;";
	}
}

function setAccountDetailsInHTML(account)
{
    if (account > 0)
    {
		web3.eth.getBalance(account, function(error, result)
		{
		    if(!error)
		    {
		        balanceWei = result.toNumber();
			    balanceEth = web3.fromWei(balanceWei, 'ether');
		 		$('#wei').html(balanceWei);
		 		$('#eth').html(parseFloat(balanceEth).toFixed(2)); 
			}
		    else
			{
		        console.error(error);
			}
		})
	}
	else
	{
		console.log("*** BIG HONKING ERROR: NO ACCOUNT SET ***");
	}
}

function setHouseData()
{
	web3.eth.getBalance(contractAddress, function(error, result)
	{
	    if(!error)
	    {
		    balanceEth = web3.fromWei(result.toNumber(), 'ether');
	 		$('#house').html(parseFloat(balanceEth).toFixed(3)); 
		}
	    else
		{
	        console.error(error);
		}
	})
	
	boxCarsContract.getMaximumBet({from: web3.eth.accounts[0]}, function(error, result) 
	{
		if (!error) 
		{
			balanceEth = web3.fromWei(result.toNumber(), 'ether');
	 		$('#max').html(parseFloat(balanceEth).toFixed(3)); 
		} 
		else 
		{
			console.error('Max bet lookup error: ' + error);
		}
	});	
	
	boxCarsContract.getMinimumBet({from: web3.eth.accounts[0]}, function(error, result) 
	{
		if (!error) 
		{
		    balanceEth = web3.fromWei(result.toNumber(), 'ether');
	 		$('#min').html(parseFloat(balanceEth).toFixed(3)); 
		} 
		else 
		{
			console.error('Min bet lookup error: ' + error);
		}
	});		
}	

function placeBet() {

   var etherBet = ($('#bet').val());

   weiBet = web3.toWei(etherBet, 'ether');
   console.log("*** PLACEBET *** \ngot bet as: " + $('#bet').val() + " = " + weiBet + " (wei)");

   boxCarsContract.placeBet({from: web3.eth.accounts[0], gas: 300000, value: weiBet}, function(error, result) {
	if(!error)
    {
        console.log("*** PLACEBET *** \ngot result: " + result + " from callback");
		betRunning = true;
		startBlock = currentBlock + 1;
		$("#bet_div").hide();
		$("#finalize_div").show();
		$("#current_roll").html("waiting for block to be mined");
		$("#roll_header").html("Game Rolls:");
	}
    else
        console.error(error);
	})
}

function finalizeBet() {
   	boxCarsContract.resolveBet({from: web3.eth.accounts[0], gas: 300000}, function(error, result) {
	if(!error)
    {
        console.log("*** FINALIZE BET *** \ngot result: " + result + " from callback");
		betRunning = false;
		startBlock = 0;
		$("#bet_div").show();
		$("#finalize_div").hide();
		$("#roll_header").html("72 Recent Rolls");
		gameWon = false;
		
	}
    else
        console.error(error);
	})
}	

