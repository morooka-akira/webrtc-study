# webrtc study

[② ローカルPCだけでP2Pの接続を実装する]()

## 事前準備(基本的にMacを想定)

```bash
npm install -g http-server
npm install -g yarn
```

- ローカルHTTPサーバのインストール
- yarnインストール

```bash
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
mkcert localhost
```

- create certfile & keyfile

## 動作確認

```bash
yarn start
```
