# webrtc study

[③ シグナリングサーバを使ってP2Pを接続する](https://inon29.hateblo.jp/entry/2020/02/09/124406)

## 事前準備(基本的にMacを想定)

```bash
npm install -g http-server
npm install -g yarn
```

- ローカルHTTPサーバのインストール
- yarnインストール

```bash
cd server
yarn
```

```bash
cd client
yarn
```

### ローカルでHTTPS接続を行うための証明書の準備

※ WebRTCは、経路暗号化されるためHTTPSでの通信が必要です。

```bash
brew install mkcert
```

```bash
mkcert --install
```

- install local ca

```bash
cd client
mkcert localhost
```

- create certfile & keyfile

## 動作確認

### サーバ起動

```bash
cd server
yarn start
```

### クライアント起動

```bash
cd server
yarn start
```

- 1.[https://localhost:8080](https://localhost:8080)をブラウザで開く(peer1)
- 2.`① setup` ボタンを押下
- 3.[https://localhost:8080](https://localhost:8080)をブラウザの別ダブで開く(peer2)
- 4.`① setup` ボタンを押下
- 5.どちらかの画面で `② send offer` ボタンを押下
