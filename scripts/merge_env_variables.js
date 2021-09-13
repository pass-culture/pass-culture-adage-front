const currentBranch = process.env.CIRCLE_BRANCH
const branchEnvFile = `.env.${currentBranch.toLowerCase()}`
const appSearchKey = process.env[`APP_SEARCH_KEY_${currentBranch.toUpperCase()}`]

const envVariablesToAppend = `REACT_APP_APP_SEARCH_KEY=${appSearchKey}\n`

const fs = require('fs');

fs.appendFileSync(branchEnvFile, envVariablesToAppend);

