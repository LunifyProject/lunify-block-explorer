async function getBlocksTxs() {
  let currentBlockData = await fetchData({ method: 'get_block', params: { height: currentHeight-1 } });
  currentBlockData = currentBlockData.result;
  
  doms.cbHash.innerHTML = `<a href="./block/${currentBlockData.block_header.hash}">${currentBlockData.block_header.hash.slice(0, 5)}...${currentBlockData.block_header.hash.slice(-5)}</a>`;
  doms.cbHeight.innerHTML = currentBlockData.block_header.height.toLocaleString('en-us');
  doms.cbReward.innerHTML = `${currentBlockData.block_header.miner_reward / (10**config.decimals)} ${config.ticker}`;
  doms.cbDifficulty.innerHTML = currentBlockData.block_header.difficulty.toLocaleString('en-us');
  doms.cbTime.innerHTML = moment(currentBlockData.block_header.timestamp * 1000).fromNow();
  doms.cbTX.innerHTML = currentBlockData.block_header.num_txes.toLocaleString('en-us');

  // Transaction pool
  let poolThead = document.createElement("tr");
  let poolTbody = document.createElement("tr");
  let poolData = await api('/mempool');
  poolData = poolData.data; 
  if(!poolData.txs.length == 0) {
    let txPoolTbody = "";
    
    poolThead.innerHTML = `
      <th><i class="fas fa-hashtag"></i> Transaction Hash</th>
      <th><i class="fas fa-hdd"></i> Size</th>
      <th class="text-end"><i class="fas fa-coins"></i> Fee</th>
      <th class="text-end"><i class="fas fa-clock"></i> Created</th>
    `;

    for(let i = 0; i < poolData.txs.length; i++) {
      txPoolTbody += `<tr>
        <th><a href="./tx/${poolData.txs[i].tx_hash}">${poolData.txs[i].tx_hash.slice(0, 5)}...${poolData.txs[i].tx_hash.slice(-5)}</a></th>
        <th>${readableBytes(poolData.txs[i].tx_size)}</th>
        <th class="text-end">${poolData.txs[i].tx_fee / (10**config.decimals)} ${config.ticker}</th>
        <th class="text-end">${moment(poolData.txs[i].timestamp * 1000).fromNow()}</th>
      </tr>`;
    }
    
    doms.poolThead.innerHTML = poolThead.innerHTML;
    doms.poolTbody.innerHTML = txPoolTbody;
  } else {
    doms.poolThead.innerHTML = `<th>No Transactions in transaction pool</th>`;
  }
  
  // Transaction in last block
  let rowThead = document.createElement("tr");
  let rowTbody = document.createElement("tr");
  if(currentBlockData.tx_hashes) {
    let blockPoolTbody = "";

    for(let i = 0; i < currentBlockData.tx_hashes.length; i++) {
      blockPoolTbody += `<tr>
        <th><i class="fas fa-hashtag"></i> Transaction Hash</th>
        <th><i class="fas fa-unlock"></i> Unlock Block</th>
        <th class="text-end"><i class="fas fa-check"></i> Status</th>
      </tr>`;
    }
    
    rowTbody.innerHTML = `
      <th><a href="./tx/${currentBlockData.tx_hashes[i]}">${currentBlockData.tx_hashes[i].slice(0, 5)}...${currentBlockData.tx_hashes[i].slice(-5)}</a></th>
      <th>${(currentBlockData.block_header.height + config.unlock_block).toLocaleString('en-us')}</th>
      <th class="text-end"><i style="color:#78c2a4;" class="fas fa-check"></i></th>
    `;

    doms.cbTxsThead.innerHTML = rowThead.innerHTML;
    doms.cbTxsTbody.innerHTML = blockPoolTbody;
  } else {
    rowThead.innerHTML = `
      <th>No Transactions in the last block</th>
    `;

    rowTbody.innerHTML = "";

    doms.cbTxsThead.innerHTML = rowThead.innerHTML;
  }

  // Last 10 txs
  let top10BlockHeight = currentBlockData.block_header.height;
  let newData = "";
  for(let i = 0; i < 10; i++) {
    let newBlock = await fetchData({ method: 'get_block', params: { height: top10BlockHeight-(i+1) } });
    newBlock = newBlock.result.block_header;

    newData += `
    <tr>
      <th><a href="./block/${newBlock.hash}">${newBlock.hash.slice(0, 5) + "..." + newBlock.hash.slice(-5)}</a></th>
      <th>${newBlock.height.toLocaleString('en-us')}</th>
      <th>${newBlock.miner_reward / (10**config.decimals)} ${config.ticker}</th>
      <th>${newBlock.difficulty.toLocaleString('en-us')}</th>
      <th>${moment(newBlock.timestamp * 1000).fromNow()}</th>
      <th class="text-end">${newBlock.num_txes.toLocaleString('en-us')}</th>
    </tr>`;
  }
  doms.last10Blocks.innerHTML = newData;
}

// Refresh every x seconds
(async() => {
  setInterval(async () => {
    await getInfo();
    await getBlocksTxs();
  }, config.api_update);
  await getInfo();
  await getBlocksTxs();
})();