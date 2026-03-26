Assuming your production machine runs Linux and has Node.js installed, here's the full process:

**1. Transfer the project**

Clone from GitHub (cleanest):
```bash
git clone https://github.com/YOUR_USERNAME/struct-academy.git
cd struct-academy
```

**2. Install dependencies and build**

```bash
npm install
npm run build
```

**3. Create the `.env` file**

```bash
cp .env.example .env
nano .env   # add your ANTHROPIC_API_KEY=sk-ant-...
```

**4. Run it**

```bash
npm start   # serves at http://localhost:4000
```

That's enough to verify it works. But if you close the terminal it dies — you need a process manager.

---

**Keep it running permanently with PM2**

```bash
npm install -g pm2
pm2 start server.js --name structacademy
pm2 save              # persist across reboots
pm2 startup           # generates the systemd command — run what it prints
```

Useful PM2 commands:
```bash
pm2 logs structacademy     # live logs
pm2 restart structacademy  # after code changes
pm2 stop structacademy
```

---


**6. Update your Apache vhost**

```apache
<IfModule mod_ssl.c>
    <VirtualHost *:443>
        ServerName structAcademy.meyer.today

        DocumentRoot /var/www/structAcademy/dist

        <Directory /var/www/structAcademy/dist>
            Options Indexes FollowSymLinks
            AllowOverride All
            Require all granted
            FallbackResource /index.html
        </Directory>

        # Proxy /api/interpret to the local Express process
        ProxyPass        /api/interpret http://localhost:4000/api/interpret
        ProxyPassReverse /api/interpret http://localhost:4000/api/interpret

        ErrorLog ${APACHE_LOG_DIR}/app_error.log
        CustomLog ${APACHE_LOG_DIR}/app_access.log combined

        ServerAlias structacademy.meyer.today
        SSLCertificateFile /etc/letsencrypt/live/structacademy.meyer.today/fullchain.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/structacademy.meyer.today/privkey.pem
        Include /etc/letsencrypt/options-ssl-apache.conf
    </VirtualHost>
</IfModule>
```

Then enable the proxy modules if not already active and reload:

```bash
sudo a2enmod proxy proxy_http
sudo systemctl reload apache2
```

**That's it.** Apache serves `dist/`. Express only handles the single `/api/interpret` POST route. You don't need Express to serve the static files at all in this setup, so `server.js` is effectively just a lightweight API proxy process.

---

**7. Deploying updates**

```bash
git pull                # get latest code
npm install             # in case dependencies changed
npm run build           # recompile
pm2 restart structacademy
```

