let numberFormatter = new Intl.NumberFormat('en-US');
function localizeNumber(number) {
  return numberFormatter.format(number);
};

function readableHashrate(hashrate) {
  let i = 0;
  const byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH', ' EH', ' ZH', ' YH' ];
  while (hashrate > 1000){
      hashrate = hashrate / 1000;
      i++;
  }
  return localizeNumber(hashrate.toFixed(2)) + byteUnits[i];
}

function readableBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 B";
  
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizes[i]}`;
}

// TODO
function generatedCoins(height) {
  return 129;
}