# 📦 pcs-react

PCSプロトコルを使ったアプリの埋め込み用のReact Componentです。

# 🔧 Usage

## setup

npm

```
npm install pcs-react
```

yarn 

```
yarn add pcs-react
```

これで他のモジュール同様に、import・require文でimportが可能です

# 📃 Usage

## 📈 Dex

PCSプロトコルのDEX周りに関するコンポーネントです。

DEXコンポーネントの1種類のみです。

コンポーネントに渡す引数には

- symbol(**必須**) DEXでの売買の対象とするトークンのシンボル
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- title(任意) コンポーネントのタイトルです。指定しない場合はデフォルト値の『Symbol名+メンバーシップ取引所』になります。
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。
- displayChart(任意) チャートを表示するかを決定するpropsです trueなら表示、falseなら非表示になります。スペースを取るのでデフォルトではfalseにしてあります。

```Javascript
import { Dex, EOS_NETWORK, THEME } from "pcs-react"

// シンボルがTSTのPCSプロトコルのトークンのチャート付きのDEX
<Dex symbol={"TST"} chartDisplay={true} network={EOS_NETWORK.kylin.asia} />

// シンボルがPCSのPCSプロトコルのトークンのチャート付きのDEX
<Dex symbol={"PCS"} chartDisplay={false} network={EOS_NETWORK.main.scatter} />
```

## 🔧 Setting

PCSプロトコルの設定周りに関するコンポーネントです。
PCSトークンの送信を行うTransfer、PCSトークンのパスワード復元・変更を行うPasswordの2つのコンポーネントと、それを1つにまとめたSettingコンポーネントの合計3つのコンポーネントからなります。

### 💸 Transfer

PCSトークンを送信するためのフォームコンポーネントです。

コンポーネントに渡す引数には

- symbol(任意) 対象とするトークンのシンボル 指定しない場合はSymbolを入力するためのフォームが現れ、ユーザーにシンボルを入力してもらう
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```Javascript
import { Transfer, THEME, EOS_NETWORK } from "pcs-react"

<Transfer symbol={"TST"} appName={"PCS_TRANSEFER"} theme={THEME.DARK} title={"Transfer pcs token"} network={EOS_NETWORK.main.scatter} />
```

### 🔑 Password

PCSトークンのパスワードを変更・復元するためのフォームコンポーネントです。

コンポーネントに渡す引数には

- symbol(任意) 対象とするトークンのシンボル 指定しない場合はSymbolを入力するためのフォームが現れ、ユーザーにシンボルを入力してもらう
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```Javascript
import { Password, EOS_NETWORK } from "pcs-react"

<Password network={EOS_NETWORK.kylin.asia} />
```
