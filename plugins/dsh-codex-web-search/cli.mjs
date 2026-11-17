#!/usr/bin/env node
import { searchWeb, status } from './backend.mjs';

const [command, ...args] = process.argv.slice(2);
const controller = new AbortController();
const cancel = () => controller.abort(new Error('Cancelled'));
process.once('SIGINT', cancel);
process.once('SIGTERM', cancel);
try {
  if (command === 'status' && !args.length) console.log(JSON.stringify(await status({}, { signal: controller.signal }), null, 2));
  else if (command === 'search' && args.length) {
    let mode = 'live';
    if (args[0] === '--cached') { mode = 'cached'; args.shift(); }
    console.log(JSON.stringify(await searchWeb({ query: args.join(' '), mode }, {}, { signal: controller.signal }), null, 2));
  } else throw new Error('Usage: node cli.mjs status | search [--cached] <query>');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  process.removeListener('SIGINT', cancel);
  process.removeListener('SIGTERM', cancel);
}
