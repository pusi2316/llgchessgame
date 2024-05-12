var express = require('express');
var util = require('../config/util.js');
const ethers = require('ethers');
var router = express.Router();

//setting an RPC provider to interact with BNB Testnet from serverside:
//Testnet RPC: https://data-seed-prebsc-1-s1.bnbchain.org:8545
//Mainnet RPC: https://bsc-dataseed.binance.org 
const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.bnbchain.org:8545');

//Getting the signer from a private key to sign write transactions. (Add your private key)
const signer = new ethers.Wallet('<PRIVATE_KEY>', provider); 
const llgContractABI = require('../utils/llg-contract-abi.json')

//Testnet address: 0x6dB11101cD2be6Db6575f7ddca4871Ad42002039
//Mainnet address: 0x4691F60c894d3f16047824004420542E4674E621
const llgContractAddress = '0x6dB11101cD2be6Db6575f7ddca4871Ad42002039';

router.get('/', function(req, res) {
    res.render('partials/play', {
        title: 'Chess Hub - Game',
        user: req.user,
        isPlayPage: true
    });
});

//router for interacting the contract.
router.get('/interact-contract', async (req, res) => {
    try {
        const contract = new ethers.Contract(llgContractAddress, llgContractABI, provider);
        let response;
        let responseValue;
        const gasLimit = 300000;
        if (signer) {
          const connectedContract = contract.connect(signer);

          //Logging the initial value of the reward cycle period.
          response = await connectedContract.rewardCyclePeriod();
          responseValue = await response.toString();
          console.log("The original value of the Reward Cycle Period: ", responseValue);

          //Setting a new value for the reward cycle period and wait for transaction confirmation.
          response = await connectedContract.setRewardCyclePeriod(12000, { gasLimit } );
          await response.wait()

          //Logging the updated value of the reward cycle period.
          response = await connectedContract.rewardCyclePeriod();
          responseValue = await response.toString();
          console.log("The new value of the Reward Cycle Period: ", responseValue);
        } else {
          response = await contract.rewardCyclePeriod();
          responseValue = await response.toString();
          console.log(responseValue);
        }
    
        // Process the response from the smart contract call (parsing data, etc.)
        const formattedResponse = { responseValue };
        res.json(formattedResponse);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error interacting with smart contract');
      }
  });

router.post('/', function(req, res) {
    var side = req.body.side;
    //var opponent = req.body.opponent; // playing against the machine in not implemented
    var token = util.randomString(20);
    res.redirect('/game/' + token + '/' + side);
});

module.exports = router;