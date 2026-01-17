# STV election app

This repository contains the source code of the frontend of [SVT app](https://github.com/jorgecarleitao/stv-app).

The source code of the application is at:

* [stv-app-deploy](https://github.com/jorgecarleitao/stv-app-deploy)
* [stv-app](https://github.com/jorgecarleitao/stv-app)
* [stv-app-frontend](https://github.com/jorgecarleitao/stv-app-frontend)

How to use:

```bash
pnpm install
pnpm run dev -- --open
```

If new translations are added, use

```bash
npm run extract-i18n
```

and provide translations in `src/locales/`.
