import "./bootstrap";
import * as commands from "./commands";
import {default as chalk} from 'chalk';

const command = process.argv[2] || null;
if (!command) {showAvailableCommands();}//;

// @ts-ignore
const commandKey: string | undefined = Object.keys(commands).find(fileCommandName => commands[fileCommandName].signature == command)
if (!commandKey) {showAvailableCommands();} //();

//@ts-ignore
const commandInstance = new commands[commandKey];
commandInstance.run()
  .catch(console.error);

function showAvailableCommands() {
  console.info(chalk.green("# Loopback console"));
  console.log("");
  console.info(chalk.green("## Available commands"));
  console.log("");
  for (const key of Object.keys(commands)) {
    // @ts-ignore
    console.info(`   - ${chalk.green(commands[key].signature)}: ${commands[key].description}`);
  }
  console.log("");
  process.exit();
}
