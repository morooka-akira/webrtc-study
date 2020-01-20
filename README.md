# webrtc study

## setup

### ① build

```bash
tsc index.ts
```

### ② start local server

```bash
http-server -S -C localhost.pem -K localhost-key.pem
```

※ see install local server

## install local server

### install

```bash
npm install -g http-server
```

### setup mkcert

```bash
brew install mkcert
```

```bash
mkcert --install
```

- install local ca

```bash
mkcert localhost
```

- create certfile & keyfile

```bash
http-server -S -C localhost.pem -K localhost-key.pem
```

- start server

## package

### typescript

```bash
yarn add -D typescript
```

### lint

```bash
yarn add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
yarn add -D prettier eslint-config-prettier eslint-plugin-prettier
```
