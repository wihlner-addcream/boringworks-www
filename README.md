# boringworks-www

Simple Astro/Tailwind site for [boringworks.se](https://boringworks.se).

## Requirements

- Node `>=22.12.0`
- npm `>=9.6.5`

## Development

```sh
npm install
npm run dev
```

Useful scripts:

- `npm run dev` starts Astro locally.
- `npm run check` runs Astro/TypeScript checks.
- `npm run build` writes the static site to `dist/`.
- `npm run preview` serves the built site locally.

## Deployment

### DNS

The VPS IPv4 address is `204.168.150.231`.

The VPS IPv6 allocation is `2a01:4f9:c010:cb63::/64`. DNS records must point to
one configured address inside that range, not to the `/64` prefix itself.

The VPS panel shows only IPv6. If the domain provider asks for a "Zone IP
Address" and the placeholder says IPv4, do not enter this IPv6 prefix there.
Either add an IPv4 address to the VPS, ask the DNS provider to create an
AAAA-only zone, or use a DNS provider that lets you create AAAA records
directly.

On the VPS, check the active address:

```sh
ip -6 addr show scope global
```

If the server is configured with `2a01:4f9:c010:cb63::1`, use these records:

```txt
Name  Type  Value
@     A     204.168.150.231
www   A     204.168.150.231
@     AAAA  2a01:4f9:c010:cb63::1
www   AAAA  2a01:4f9:c010:cb63::1
```

In DNS editors that show the zone suffix separately, enter `@` for the apex
record and `www` for the subdomain. Do not enter `boringworks.se` or
`www.boringworks.se` as the name if the UI appends `.boringworks.se`, or the
records may become `boringworks.se.boringworks.se` and
`www.boringworks.se.boringworks.se`.

If DNSSEC was enabled at the previous DNS provider, remove the stale DS record
at the registrar or enable DNSSEC in Hetzner DNS and publish Hetzner's DS
record. A stale DS record causes validating resolvers and Let's Encrypt to fail
with `DNSKEY Missing`.

### Build and Upload

Connect to the VPS over IPv4:

```sh
ssh -p 2222 holu@204.168.150.231
```

The server was created with the Hetzner basic cloud-config tutorial. That setup
creates the `holu` user, disables SSH password authentication, disables root
SSH login, and moves SSH from port `22` to port `2222`.

If your private SSH key is not the default key:

```sh
ssh -i ~/.ssh/YOUR_KEY_FILE -p 2222 holu@204.168.150.231
```

If the private key has a passphrase, add it to the local SSH agent before
deploying:

```sh
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

Build the site and copy `dist/` to the VPS path used by `Caddyfile`:

```sh
npm run build
rsync -az -e 'ssh -p 2222' --delete dist/ holu@204.168.150.231:/var/www/boringworks.se/dist/
```

When connecting directly to an IPv6 address, wrap the address in brackets:

```sh
rsync -az --delete dist/ 'root@[2a01:4f9:c010:cb63::1]:/var/www/boringworks.se/dist/'
```

Install or copy `Caddyfile` into your Caddy config and reload Caddy after the
DNS records for `boringworks.se` and `www.boringworks.se` point at the VPS.
Make sure inbound TCP ports `80` and `443` are open in the VPS firewall.

On the VPS:

```sh
sudo apt-get install -y caddy
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo install -m 0644 Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
```
