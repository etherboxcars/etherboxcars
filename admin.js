

abi = JSON.parse('[{"constant":true,"inputs":[],"name":"getMaximumBet","outputs":[{"name":"max","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"blockNumber","type":"uint256"}],"name":"displayDiceRoll","outputs":[{"name":"","type":"uint8[2]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getBankroll","outputs":[{"name":"bankroll","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"blockNumber","type":"uint256"},{"name":"player","type":"address"}],"name":"getDiceRoll","outputs":[{"name":"roll","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"player","type":"address"}],"name":"playerHasBet","outputs":[{"name":"active","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"listPlayers","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMinimumBet","outputs":[{"name":"min","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"cleanupOldBets","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"resolveBet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"houseBankroll","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"roll","type":"uint8"}],"name":"translateDiceRoll","outputs":[{"name":"","type":"uint8[2]"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"reset","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"topUp","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"placeBet","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"blockNumber","type":"uint256"}],"name":"LogBetMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"blockNumber","type":"uint256"}],"name":"LogBetWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"blockNumber","type":"uint256"}],"name":"LogBetLost","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LogFallback","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LogTopUp","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"accountAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"LogPayment","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"string"}],"name":"LogMessage","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"string"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogMessage","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"string"},{"indexed":false,"name":"player","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogMessage","type":"event"}]')

var boxCarsContract, contractAddress;

logs_loaded = false;

// check if live on mainnet
onMainNet = false;

window.addEventListener('load', function() {
	
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

		//getLogs();

		web3.eth.getBlock("latest", function(error, block) {
			if(!error) 
				refreshBlockData(block);
			else
				console.log("error in startup data read");
		})	
		
		listenForNewBlocks(boxCarsContract);
	})
})


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
	if (logs_loaded)
	{	
		console.log("listening for new logs");
		updateLogs(block);
	}
	
/*	boxCarsContract.getMinimumBet(function(error, result) {
		if (!error) 
		{
			console.log("minimum bet:");
			console.log("min bet: " + result.toString());
		} 
		else 
		{
			console.log("error in min bet");
			console.error(error);
		}
	});
	
	var result = myContract.methods.owner.call().call((error, result) => {
    console.log(result);
});
		*/
	
	console.log("admin address: " + web3.eth.accounts[0]);
	
	boxCarsContract.owner((error, result) => console.log("owner address: " + result.toString()));

		
	boxCarsContract.listPlayers({from: web3.eth.accounts[0]}, function(error, result) {
		if(!error)
	    {
			$("#players").html("");
			result.forEach(player => $("#players").append(player + "<br>"));
		}
	})	
}	

function updateLogs(block)
{
    for (var i=0; i<block.logs.length; i++) {
   	    console.log("Updated... Message Log: " + response.logs[i].args.msg); 
    }
}

function getLogText(log) 
{
	let message = "block: " + log.blockNumber;
	if (log.args.msg != null) message += " msg: " + log.args.msg;
	if (log.args.value != null) message += " value: " + log.args.value;
	if (log.address != null) message += " address: " + log.address;
    return message;
}

function getLogs()
{
	console.log("getting existing logs");
	
	$("#log_bets_made").html("<p>bets made</p>");
	$("#log_bets_won").html("<p>bets won</p>");
	$("#log_bets_lost").html("<p>bets lost</p>");
	
	let events = boxCarsContract.allEvents({fromBlock: 0, toBlock: 'latest'});
	events.get((error, logs) => {
  	 logs.forEach(log => {
		let message = getLogText(log);
		console.log("echo: " + message);
	  })	
	});
	
	let betMadeEvent = boxCarsContract.LogBetMade({}, {fromBlock: 0, toBlock: 'latest'})
	betMadeEvent.get((error, logs) => {
	  // we have the logs, now print them
	  logs.forEach(log => {
		console.log(log);
  	   let message = "bet made: " + getLogText(log);
		$("#log_bets_made").append("<p>" + message + "</p>")
		console.log("bet made: " + message);
	  })	
	})
	
	let betWonEvent = boxCarsContract.LogBetWon({}, {fromBlock: 0, toBlock: 'latest'})
	betWonEvent.get((error, logs) => {
	  // we have the logs, now print them
	  logs.forEach(log => $("#log_bets_made").append("<p>" + getLogText(log) + "</p>"))
	})
	
	let betLostEvent = boxCarsContract.LogBetLost({}, {fromBlock: 0, toBlock: 'latest'})
	betLostEvent.get((error, logs) => {
	  // we have the logs, now print them
	  logs.forEach(log => $("#log_bets_made").append("<p>" + getLogText(log) + "</p>"))
	})
}

