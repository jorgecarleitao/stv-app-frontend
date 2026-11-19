# Open Vote — ranked-ballot election app (frontend)

This repository contains the source code of the frontend of [Open Vote](https://open-vote.eu) (formerly STVote at stvote.eu), a secure, transparent, and auditable election platform supporting multiple ranked-ballot voting systems: STV (Meek/Droop), Copeland-ordered STV, grouped STV, and Schulze for single-winner elections.

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
