# This project will make a test connection to the Adyen payment platform

To make this work an entry in the hosts file will be needed:
```
127.0.0.1       cabiri.dev.com
```

## To generate the keys

```json
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/CN=cabiri.dev.com'
```
