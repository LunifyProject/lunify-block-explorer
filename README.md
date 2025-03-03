# lunify-block-explorer

It would be prefered to host this page on a **subdomain** or normal **domain** but not in a subdirectory, for example **explorer.lunify.xyz**.

## Setting up the block explorer

1. Install `apache2` and enable `proxy` and `proxy_http`
```bash
sudo apt-get install apache2
sudo a2enmod proxy
sudo a2enmod proxy_http
```

2. Edit `/etc/apache2/sites-available/000-default.conf` and add this (change `yourPublicDomainOrSubdomain.com` to your public domain or subdomain):
```apache
<VirtualHost *:80>
        ServerName yourPublicDomainOrSubdomain.com
        DocumentRoot /var/www/html

        ProxyPass /node-api/ http://127.0.0.1:25252/
        ProxyPassReverse /node-api/ http://127.0.0.1:25252/

        ProxyPass /api/ http://127.0.0.1:25254/
        ProxyPassReverse /api/ http://192.168.1.178:25254/

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

2. Clone the repository and put it in your apache folder.
```bash
cd /var/www/html
```

3. Clone and compile the Lunify daemon or download the precompiled binaries from https://github.com/LunifyProject/Lunify

4. Run `lunifyd` with the following required parameters
```bash
 ./lunifyd --rpc-bind-ip 0.0.0.0 --confirm-external-bind --rpc-access-control-origins "*" --restricted-rpc
```

5. Download `lfiblocks` from https://github.com/LunifyProject/onion-lunify-blockchain-explorer/releases/latest

6. Run `lfiblocks` with the following required parameters
```bash
./lfiblocks --enable-json-api --enable-mixin-details --port 25254
```

7. Forward/open port `25252` and `25254`

8. Open the `js/config.js` file and change `api_url` to `http://yourPublicDomainOrSubdomain.com/node-api` and `new_api_url` to `http://yourPublicDomainOrSubdomain.com/api`

### NOTE:
We will be making this process more easy in the future.