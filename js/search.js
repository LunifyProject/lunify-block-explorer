doms.searchBar.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    await searchBlockTX();
  }
});

async function searchBlockTX() {
  let searchbarVal = doms.searchBar.value.trim();

  if (/^\d+$/.test(searchbarVal)) {
    let getBlockByHeight = await fetchData({ method: 'get_block_header_by_height', params: { height: parseInt(searchbarVal) } });

    if(getBlockByHeight.error) {
      // error handler
    } else {
      window.location.href = `/block/${getBlockByHeight.result.block_header.hash}`;
    }
  } else if (/^[0-9a-fA-F]{64}$/.test(searchbarVal)) {
    let getBlockByHash = await fetchData({ method: 'get_block_header_by_hash', params: { hash: searchbarVal } });
    let getTxByHash = await fetchData({ methodCall: 'POST', req: '/get_transactions', params: {
      "txs_hashes": [searchbarVal],
      "decode_as_json": true,
      "prune": true
    } });

    // Check for block or TX
    if(!getBlockByHash.error) {
      window.location.href = `/block/${getBlockByHash.result.block_header.hash}`;
    } else if(!getTxByHash.missed_tx) {
      window.location.href = `/tx/${getTxByHash.txs[0].tx_hash}`;
    } else {
      // error
    }
  }
}

