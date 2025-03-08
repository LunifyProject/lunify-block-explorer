const currentUrl = location.href.replace('https://', '').replace('http://', '');
const pathParts = currentUrl.split('/');
const blockInfo = pathParts[2];

async function goToBlock(height) {
  let getBlock = await api(`/block/${parseInt((height >= currentHeight-1 ? currentHeight-1 : height))}`);
  window.location.href = `/block/${getBlock.data.hash}`;
}

(async() => {
  if (blockInfo) {
    if (blockInfo.length == 64) {
      let getBlockHeight = await fetchData({ method: 'get_block_header_by_hash', params: { hash: blockInfo } })
      
      // If block does exist, else redirect
      if(!getBlockHeight.error) {
        let getBlock = await fetchData({ method: 'get_block', params: { height: getBlockHeight.result.block_header.height } })
        getBlock = getBlock.result;

        document.title = `Lunify - Block ${getBlock.block_header.height.toLocaleString('en-us')}`;

        previousBlock.setAttribute('onclick', `goToBlock(${(getBlock.block_header.height-1 < 0 ? 0 : getBlock.block_header.height-1)})`);
        nextBlock.setAttribute('onclick', `goToBlock(${getBlock.block_header.height+1})`);

        doms.blockHash.innerHTML = `${getBlock.block_header.hash}`;
        
        doms.cbHeight.innerHTML = getBlock.block_header.height.toLocaleString('en-us');
        doms.cbTime.innerHTML = moment(getBlock.block_header.timestamp * 1000).fromNow();
        doms.cbDifficulty.innerHTML = getBlock.block_header.difficulty.toLocaleString('en-us');
        
        doms.cbBlockSize.innerHTML = readableBytes(getBlock.block_header.block_size);
        doms.cbGeneratedCoins.innerHTML = `${generatedCoins(getBlock.block_header.height)} LFI`;
        doms.cbTX.innerHTML = getBlock.block_header.num_txes.toLocaleString('en-us');

        doms.cbReward.innerHTML = `${getBlock.block_header.miner_reward / (10**config.decimals)} ${config.ticker}`;
        doms.cbUnlocked.innerHTML = `${(getBlock.block_header.height + config.unlock_block).toLocaleString('en-us')}`;
        
        // Coinbase Transaction
        let coinbaseTxData = await api(`/block/${getBlock.block_header.hash}`);
        coinbaseTxData = coinbaseTxData.data;
        for(let i = 0; i < coinbaseTxData.txs.length; i++) {
          if(coinbaseTxData.txs[i].coinbase == true) {
            doms.cbTxsTbodyCoinbase.innerHTML = `
            <tr>
              <th><a href="/tx/${coinbaseTxData.txs[i].tx_hash}">${coinbaseTxData.txs[i].tx_hash.slice(0, 5)}...${coinbaseTxData.txs[i].tx_hash.slice(-5)}</a></th>
              <th>${coinbaseTxData.txs[i].lfi_outputs / (10**config.decimals)} ${config.ticker}</th>
            </tr>`;

            if((coinbaseTxData.txs[i].lfi_outputs / (10**config.decimals)) == config.premine_amount) {
              doms.coinbaseType.innerHTML = `(Premine)`;
            }
          }
        }

        // Transaction
        let rowThead = document.createElement("tr");
        let rowTbody = document.createElement("tr");
        let txCountBlock = 0;
        if(getBlock.tx_hashes) {
          for(let i = 0; i < getBlock.tx_hashes.length; i++) {
            let getTx = await fetchData({ methodCall: 'POST', req: '/get_transactions', params: {
              "txs_hashes": [getBlock.tx_hashes[i]],
              "decode_as_json": true,
              "prune": true
            } });
            let getTxJson = JSON.parse(getTx.txs_as_json);
            
            rowThead.innerHTML = `
              <th><i class="fas fa-hashtag"></i> Transaction Hash</th>
              <th><i class="fas fa-coins"></i> Amount</th>
              <th><i class="fas fa-coins"></i> Fee</th>
              <th><i class="fas fa-unlock"></i> Unlock Block</th>
            `;

            rowTbody.innerHTML = `
              <th><a href="/tx/${getBlock.tx_hashes[i]}">${getBlock.tx_hashes[i].slice(0, 5)}...${getBlock.tx_hashes[i].slice(-5)}</a></th>
              <td><i class="fas fa-lock"></i> Confidential</th>
              <th>${getTxJson.rct_signatures.txnFee / (10**config.decimals)} ${config.ticker}</th>
              <th>${(getBlock.block_header.height + config.unlock_block).toLocaleString('en-us')}</th>
            `;

            doms.cbTxsThead.innerHTML = rowThead.innerHTML;
            doms.cbTxsTbody.innerHTML = rowTbody.innerHTML;

            txCountBlock++;
          }
        } else {
          rowThead.innerHTML = `
            <th style="border-bottom: 0px;">No transactions found</th>
          `;

          rowTbody.innerHTML = "";

          doms.cbTxsThead.innerHTML = rowThead.innerHTML;
        }
        
        doms.txCountBlock.innerHTML = txCountBlock;
      } else {
        window.location.href = "/";
      }
    }
  } else {
    window.location.href = "/";
  }

  // Refresh every x seconds
  setInterval(async () => {
    await getInfo();
  }, config.api_update);
  await getInfo();
})();