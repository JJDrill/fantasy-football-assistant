// yahoo/get-free-agents.js
const { launchContext } = require('./browser');
const { getFreeAgents } = require('./pages/free-agents-page');

async function main() {
  const position = process.argv[2]; // optional
  const context = await launchContext();
  const page = await context.newPage();
  const agents = await getFreeAgents(page, { position });
  console.log(JSON.stringify(agents, null, 2));
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
