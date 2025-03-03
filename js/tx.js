const currentUrl = location.href.replace('https://', '').replace('http://', '');
const pathParts = currentUrl.split('/');
const txInfo = pathParts[2];

function toggleInputs(dom, clicky) {
  dom = document.getElementById(dom);
  clicky = clicky.querySelector("i");
  
  if(clicky.classList.value.includes('fa-plus')) {
    clicky.classList.remove('fa-plus');
    clicky.classList.add('fa-minus');
    dom.classList.remove('d-none');
  } else {
    clicky.classList.remove('fa-minus');
    clicky.classList.add('fa-plus');
    dom.classList.add('d-none');
  }
}

(async() => {
  if (txInfo) {
    if (txInfo.length == 64) {
      let getTxByHash = await api(`/transaction/${txInfo}`);

      // If tx does exist, else redirect
      if(getTxByHash.status == "success") {
        getTxByHash = getTxByHash.data;

        doms.txHash.innerHTML = getTxByHash.tx_hash;
        let totalOutputs = 0;

        // Inputs
        if(getTxByHash.inputs) {
          let vins = "";
          doms.txInputs.innerHTML = getTxByHash.inputs.length;
          for(let i = 0; i < getTxByHash.inputs.length; i++) {
            let vinsTotal = "";
            for(let j = 0; j < getTxByHash.inputs[i].mixins.length; j++) {
              let getBlockHash = await api(`/block/${getTxByHash.inputs[i].mixins[j].block_no}`);
              vinsTotal += `
              <tr class="cur-pointer" onclick="window.location.href='/block/${getBlockHash.data.hash}'">
                <th>${getTxByHash.inputs[i].mixins[j].block_no.toLocaleString('en-us')}</th>
                <th><code>${getTxByHash.inputs[i].mixins[j].public_key}</code></th>
              </tr>`;
            }

            vins += `<tr>
              <th style="display: flex; justify-content: center; margin-bottom: -1px;"><span onclick="toggleInputs('${getTxByHash.inputs[i].key_image}', this)" class="cur-pointer"><i class="fas fa-plus"></i></span></th>
              <th class="ff-monospace">${(getTxByHash.inputs[i].amount / (10**config.decimals)).toFixed(config.decimals)} ${config.ticker}</th>
              <th><code>${getTxByHash.inputs[i].key_image}</code></th>
            </tr>
            <tr class="d-none" id="${getTxByHash.inputs[i].key_image}">
              <th colspan="3">
                <table class="table" style="background-color: #ffffff0a; border-radius: 4px;">
                  <thead>
                    <tr>
                      <th>From Block</th>
                      <th>Public Key</th>
                    </tr>
                  </thead>
                  <tbody class="ff-monospace">
                    ${vinsTotal}
                  </tbody>
                </table>
              </th>
            </tr>`;
          }
          doms.txVins.innerHTML = vins;
        } else {
          doms.txInputs.innerHTML = 0;
        }

        // Ouputs
        let vouts = "";
        doms.txOuputs.innerHTML = getTxByHash.outputs.length;
        for(let i = 0; i < getTxByHash.outputs.length; i++) {
          totalOutputs += getTxByHash.outputs[i].amount;
          vouts += `<tr>
            <th class="ff-monospace">${(getTxByHash.outputs[i].amount / (10**config.decimals)).toFixed(config.decimals)} ${config.ticker}</th>
            <th class="ff-monospace"><code>${getTxByHash.outputs[i].public_key}</code></th>
          </tr>`;
        }
        doms.txVouts.innerHTML = vouts;
        
        document.title = `Lunify - TX ${getTxByHash.tx_hash}`;

        // Header TX info
        let getBlockHash = await api(`/block/${getTxByHash.block_height}`);
        doms.txHeight.innerHTML = (getTxByHash.block_height == 0 ? '-' : `<a href="/block/${getBlockHash.data.hash}">${getTxByHash.block_height.toLocaleString('en-us')}</a>`);
        doms.txTimestamp.innerHTML = moment(getTxByHash.timestamp * 1000).fromNow();
        doms.txSumOutputs.innerHTML = `${(totalOutputs == 0 ? '<i class="fas fa-lock"></i> Confidential' : `${totalOutputs / (10**config.decimals)} ${config.ticker}`)}`;
        doms.txFee.innerHTML = `${getTxByHash.tx_fee / (10**config.decimals)} ${config.ticker}`;
        doms.txConfirmations.innerHTML = getTxByHash.confirmations.toLocaleString('en-us');
        doms.txUnlocked.innerHTML = `<i class="fas fa-${(getTxByHash.confirmations >= config.unlock_block ? 'check' : 'times')} ${(getTxByHash.confirmations >= config.unlock_block ? 'cGreen' : 'cRed')}"></i>`;
        doms.txSizee.innerHTML = readableBytes(getTxByHash.tx_size);
        doms.txRingSize.innerHTML = getTxByHash.mixin;
        doms.txExtra.innerHTML = `<code>${getTxByHash.extra}</code>`;
        doms.txCoinbase.innerHTML = `<i class="fas fa-${(getTxByHash.coinbase ? 'check' : 'times')} ${(getTxByHash.coinbase ? 'cGreen' : 'cRed')}"></i>`;
        doms.txPID.innerHTML = (getTxByHash.payment_id == '' ? '-' : `<code>${getTxByHash.payment_id}</code>`);

      } else {
        window.location.href = "/";
      }
    } else if (!isNaN(txInfo)) {
      window.location.href = "/";
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