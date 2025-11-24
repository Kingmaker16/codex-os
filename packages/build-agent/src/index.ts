import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, "../templates");

const program = new Command();
program
  .name("codex")
  .description("Codex Build Agent CLI — scaffold, test, package, deploy, review")
  .version("0.2.0");

program
  .command("ping")
  .description("Quick health check")
  .action(() => console.log(chalk.green("✓ Codex Build Agent is alive.")));

program
  .command("scaffold")
  .argument("<template>", "template type (service | bridge | orchestrator)")
  .argument("<name>", "name of the new project")
  .description("Scaffold a new module from a built-in template")
  .action(async (template: string, name: string) => {
    const src = path.join(templatesDir, template);
    const dest = path.resolve(process.cwd(), name);

    if (!fs.existsSync(src)) {
      console.log(chalk.red(`✗ Unknown template: ${template}`));
      process.exit(1);
    }

    if (fs.existsSync(dest)) {
      console.log(chalk.yellow(`⚠️  Target folder already exists: ${dest}`));
      process.exit(1);
    }

    console.log(chalk.cyan(`→ Scaffolding ${template}:${name} …`));
    await fs.copy(src, dest);
    console.log(chalk.green(`✓ Created ${dest}`));
  });

program.parseAsync(process.argv);
