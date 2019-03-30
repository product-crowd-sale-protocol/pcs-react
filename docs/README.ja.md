# 📦 pcs-react

PCSプロトコルの使ったアプリの埋め込み用のReact Componentです。

# 🔧 Usage

## setup

**このパッケージは現在開発中で、npmにも未登録です。 よってこのパッケージを使う際には、自分でパッケージをビルドし、ローカルのnpmとリンクさせる必要があります。 以下のコマンドはこのpcs-reactパッケージのディレクトリで行ってください。**

npm

```
git clone https://github.com/product-crowd-sale-protocol/pcs-react.git
cd pcs-react

npm install // install dependencies
npm run-scripts build // build package using webpack and babel
npm link // link this package with local npm
```

yarn 

```
git clone https://github.com/product-crowd-sale-protocol/pcs-react.git
cd pcs-react

yarn install // install dependencies
yarn build // build package using webpack and babel
yarn link // link this package with local yarn
```


**今度はローカルのnpmにリンクさせたpcs-reactを自分のアプリにリンクさせます。以下のコマンドは自分のアプリのディレクトリでおこなってください。**

npm

```
cd your-app
npm link pcs-react // this command must be executed in your app directory.
```

yarn

```
cd your-app
yarn link pcs-react // this command must be executed in your app directory.
```

これで他のモジュール同様に、import・require文でimportが可能です

# 📃 Usage

## 📈 Dex

PCSプロトコルのDEX周りに関するコンポーネントです。

DEXコンポーネントの1種類のみです。

コンポーネントに渡す引数には

- symbol(**必須**) DEXでの売買の対象とするトークンのシンボル
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- theme(任意) コンポーネントのデザインテーマ THEMEをインポートしてDARK か WHITEのどちらかから選択してください。　指定しない場合はデフォルト値のDARKになります
- title(任意) コンポーネントのタイトルです。指定しない場合はデフォルト値の『Symbol名+メンバーシップ取引所』になります。
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。
- displayChart(任意) チャートを表示するかを決定するpropsです trueなら表示、falseなら非表示になります。スペースを取るのでデフォルトではfalseにしてあります。

```
import { Dex, EOS_NETWORK, THEME } from "pcs-react"

// シンボルがTSTのPCSプロトコルのトークンのチャート付きのDEX
<Dex symbol={"TST"} chartDisplay={true} appName={"PCS_DEX_EXAMPLE"} theme={THEME.WHITE} network={EOS_NETWORK.kylin.asia} />

// シンボルがPCSのPCSプロトコルのトークンのチャート付きのDEX
<Dex symbol={"PCS"} chartDisplay={false} theme={THEME.DARK} network={EOS_NETWORK.main.scatters} />
```

## 🔧 Setting

PCSプロトコルの設定周りに関するコンポーネントです。
PCSトークンの送信を行うTransfer、PCSトークンのパスワード復元・変更を行うPassword、Scatterのログイン管理をするScatterの三つのコンポーネントと、それを一つにまとめたSettingコンポーネントの合計4つのコンポーネントからなります。

### 💸 Transfer

PCSトークンを送信するためのフォームコンポーネントです。

コンポーネントに渡す引数には

- symbol(任意) 対象とするトークンのシンボル 指定しない場合はSymbolを入力するためのフォームが現れ、ユーザーにシンボルを入力してもらう
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- theme(任意) コンポーネントのデザインテーマ THEMEをインポートしてDARK か WHITEのどちらかから選択してください。　指定しない場合はデフォルト値のDARKになります
- title(任意) コンポーネントのタイトルです。指定しない場合はデフォルト値の『💸 トークン送信』になります。
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```
import { Transfer, THEME, EOS_NETWORK } from "pcs-react"

<Transfer symbol={"TST"} appName={"PCS_TRANSEFER"} theme={THEME.DARK} title={"Transfer pcs token"} network={EOS_NETWORK.main.scatter} />
```

### 🔑 Password

PCSトークンのパスワードを変更・復元するためのフォームコンポーネントです。

コンポーネントに渡す引数には

- symbol(任意) 対象とするトークンのシンボル 指定しない場合はSymbolを入力するためのフォームが現れ、ユーザーにシンボルを入力してもらう
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- theme(任意) コンポーネントのデザインテーマ THEMEをインポートしてDARK か WHITEのどちらかから選択してください。　指定しない場合はデフォルト値のDARKになります
- title(任意) コンポーネントのタイトルです。指定しない場合はデフォルト値の『🔑 パスワード変更・再設定・復元』になります。
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```
import { Password, EOS_NETWORK } from "pcs-react"

<Password network={EOS_NETWORK.kylin.asia} />
```

### ⛓ Scatter

EOSの署名生成クライアントのScatterのログイン管理をするためのコンポーネントです。

コンポーネントに渡す引数には

- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- theme(任意) コンポーネントのデザインテーマ THEMEをインポートしてDARK か WHITEのどちらかから選択してください。　指定しない場合はデフォルト値のDARKになります
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```
import { Scatter, THEME, EOS_NETWORK } from "pcs-react"

<Scatter theme={THEME.WHITE} appName={"PCS_SCATTER"} network={EOS_NETWORK.main.lions} />
```

### 🔨 Setting

PCSトークンの送信を行うTransfer、PCSトークンのパスワード復元・変更を行うPassword、Scatterのログイン管理をするScatterの三つのコンポーネントをまとめたコンポーネントです。

コンポーネントに渡す引数には

- symbol(任意) 対象とするトークンのシンボル 指定しない場合はSymbolを入力するためのフォームが現れ、ユーザーにシンボルを入力してもらう
- appName(任意) Scatterに表示されるアプリケーション名 指定しない場合はデフォルト値のPCS_APPとなります。
- theme(任意) コンポーネントのデザインテーマ THEMEをインポートしてDARK か WHITEのどちらかから選択してください。　指定しない場合はデフォルト値のDARKになります
- network(**必須**) 利用するEOSノードの情報をまとめたオブジェクトです。EOS_NETWORKをインポートして利用するネットワークを選択してください。

```
import { Setting, THEME, EOS_NETWORK } from "pcs-react"

<Setting symbol={"TST"} theme={THEME.DARK} appName={"PCS_SETTING"} network={EOS_NETWORK.kylin.laomao} />
```

