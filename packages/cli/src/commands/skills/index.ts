import { Command } from "commander";
import chalk from "chalk";
import inquirer from "@clack/prompts";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createSkillsCommand(): Command {
  const skills = new Command("skills");

  skills
    .name("skills")
    .description("Manage skills - reusable agent capabilities that compound over time")
    .addCommand(createSkillsListCommand())
    .addCommand(createSkillsCreateCommand())
    .addCommand(createSkillsGetCommand())
    .addCommand(createSkillsUpdateCommand())
    .addCommand(createSkillsDeleteCommand())
    .addCommand(createSkillsRecommendCommand())
    .addCommand(createSkillsImportCommand())
    .addCommand(createSkillsExportCommand());

  return skills;
}

function createSkillsListCommand(): Command {
  return new Command("list")
    .description("List all skills in the workspace")
    .option("--agent <type>", "Filter by agent type")
    .option("--tag <tag>", "Filter by tag (can be used multiple times)")
    .option("--sort <field>", "Sort by: name, usage, success, created", "usage")
    .option("--order <order>", "Sort order: asc, desc", "desc")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const skills = await client.skill.list();

        let filtered = skills;

        if (options.agent) {
          filtered = filtered.filter((s: any) => s.agentType === options.agent);
        }

        if (options.tag) {
          const tags = Array.isArray(options.tag) ? options.tag : [options.tag];
          filtered = filtered.filter((s: any) =>
            tags.every((tag: string) => s.tags?.includes(tag))
          );
        }

        if (options.sort) {
          filtered.sort((a: any, b: any) => {
            let aVal: any, bVal: any;
            switch (options.sort) {
              case "name":
                aVal = a.title;
                bVal = b.title;
                break;
              case "usage":
                aVal = a.usageCount;
                bVal = b.usageCount;
                break;
              case "success":
                aVal = a.successRate;
                bVal = b.successRate;
                break;
              case "created":
                aVal = new Date(a.createdAt);
                bVal = new Date(b.createdAt);
                break;
              default:
                aVal = a.usageCount;
                bVal = b.usageCount;
            }
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return options.order === "desc" ? -cmp : cmp;
          });
        }

        if (options.output === "json") {
          console.log(JSON.stringify(filtered, null, 2));
          return;
        }

        console.log(chalk.bold(`\n📚 Skills (${filtered.length})\n`));

        if (filtered.length === 0) {
          console.log(chalk.yellow("  No skills found. Create one with 'synapse skills create'\n"));
          return;
        }

        filtered.forEach((skill: any) => {
          const successColor = skill.successRate >= 80 ? chalk.green : skill.successRate >= 50 ? chalk.yellow : chalk.red;
          console.log(`  ${chalk.cyan(skill.title)}`);
          console.log(`    ${skill.description}`);
          console.log(
            `    Usage: ${chalk.blue(skill.usageCount)} | ` +
            `Success: ${successColor(`${skill.successRate.toFixed(1)}%`)} | ` +
            `Agent: ${skill.agentType || "any"}`
          );
          if (skill.tags && skill.tags.length > 0) {
            console.log(`    Tags: ${skill.tags.map((t: string) => chalk.gray(`[${t}]`)).join(" ")}`);
          }
          console.log();
        });
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list skills:"), error);
      }
    });
}

function createSkillsCreateCommand(): Command {
  return new Command("create")
    .description("Create a new skill")
    .requiredOption("--title <title>", "Skill title")
    .requiredOption("--prompt <prompt>", "Skill prompt/instructions")
    .option("--description <text>", "Skill description")
    .option("--agent <type>", "Target agent type: claude_code, codex, opencode, etc.")
    .option("--tags <tags>", "Comma-separated tags")
    .option("--examples <file>", "File containing example inputs/outputs (JSON array)")
    .option("--verification <steps>", "Verification steps (comma-separated)")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();

        let examples = undefined;
        if (options.examples) {
          const fs = await import("node:fs");
          examples = JSON.parse(fs.readFileSync(options.examples, "utf-8"));
        }

        let verificationSteps = undefined;
        if (options.verification) {
          verificationSteps = options.verification.split(",").map((s: string) => s.trim());
        }

        let tags = undefined;
        if (options.tags) {
          tags = options.tags.split(",").map((s: string) => s.trim());
        }

        const skill = await client.skill.create({
          title: options.title,
          description: options.description || options.title,
          prompt: options.prompt,
          agentType: options.agent,
          tags,
          examples,
          verificationSteps,
        });

        console.log(chalk.green(`\n✅ Skill created successfully!`));
        console.log(chalk.blue(`   ID: ${skill.id}`));
        console.log(chalk.blue(`   Title: ${skill.title}`));
        console.log(chalk.blue(`   Usage Count: ${skill.usageCount}`));
        console.log(chalk.blue(`   Success Rate: ${skill.successRate.toFixed(1)}%`));
        console.log();

        const useNow = await inquirer.confirm({
          message: "Would you like to test this skill now?",
          initialValue: false,
        });

        if (useNow) {
          const testInput = await inquirer.text({
            message: "Enter test input:",
            placeholder: "Type a test case for this skill...",
          });

          console.log(chalk.blue("\n⏳ Running skill..."));
          console.log(chalk.gray(`Prompt: ${options.prompt}`));
          console.log(chalk.gray(`Test Input: ${testInput}\n`));
          console.log(chalk.yellow("(Skill execution not yet implemented - will be integrated with agent runtime)"));
        }
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to create skill:"), error);
        process.exit(1);
      }
    });
}

function createSkillsGetCommand(): Command {
  return new Command("get")
    .description("Get skill details")
    .argument("<skill-id>", "Skill ID")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (skillId, options) => {
      try {
        const client = await getSynapseClient();
        const skill = await client.skill.get(skillId);

        if (options.output === "json") {
          console.log(JSON.stringify(skill, null, 2));
          return;
        }

        const successColor = skill.successRate >= 80 ? chalk.green : skill.successRate >= 50 ? chalk.yellow : chalk.red;

        console.log(chalk.bold(`\n📚 Skill: ${skill.title}\n`));
        console.log(`  ID:           ${chalk.cyan(skill.id)}`);
        console.log(`  Description:   ${skill.description}`);
        console.log(`  Agent Type:   ${skill.agentType || chalk.gray("any")}`);
        console.log(`  Created By:   ${skill.createdBy}`);
        console.log(`  Created At:   ${new Date(skill.createdAt).toLocaleString()}`);
        console.log(`  Usage Count:  ${chalk.blue(skill.usageCount)}`);
        console.log(`  Success Rate: ${successColor(`${skill.successRate.toFixed(1)}%`)}`);

        if (skill.tags && skill.tags.length > 0) {
          console.log(`  Tags:         ${skill.tags.join(", ")}`);
        }

        console.log(chalk.bold("\n  Prompt:"));
        console.log(`  ${skill.prompt.split("\n").join("\n  ")}`);

        if (skill.verificationSteps && skill.verificationSteps.length > 0) {
          console.log(chalk.bold("\n  Verification Steps:"));
          skill.verificationSteps.forEach((step: string, i: number) => {
            console.log(`  ${i + 1}. ${step}`);
          });
        }

        if (skill.examples && skill.examples.length > 0) {
          console.log(chalk.bold("\n  Examples:"));
          skill.examples.forEach((ex: any, i: number) => {
            console.log(`  Example ${i + 1}:`);
            console.log(`    Input:  ${ex.input}`);
            console.log(`    Output: ${ex.output}`);
          });
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to get skill:"), error);
      }
    });
}

function createSkillsUpdateCommand(): Command {
  return new Command("update")
    .description("Update a skill")
    .argument("<skill-id>", "Skill ID")
    .option("--title <title>", "New title")
    .option("--description <text>", "New description")
    .option("--prompt <prompt>", "New prompt")
    .option("--tags <tags>", "New tags (comma-separated)")
    .action(async (skillId, options) => {
      try {
        const client = await getSynapseClient();

        let tags = undefined;
        if (options.tags) {
          tags = options.tags.split(",").map((s: string) => s.trim());
        }

        await client.skill.update(skillId, {
          title: options.title,
          description: options.description,
          prompt: options.prompt,
          tags,
        });

        console.log(chalk.green(`\n✅ Skill ${skillId} updated successfully!\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to update skill:"), error);
        process.exit(1);
      }
    });
}

function createSkillsDeleteCommand(): Command {
  return new Command("delete")
    .description("Delete a skill")
    .argument("<skill-id>", "Skill ID")
    .option("--force", "Skip confirmation")
    .action(async (skillId, options) => {
      try {
        if (!options.force) {
          const confirm = await inquirer.confirm({
            message: `Are you sure you want to delete skill ${skillId}?`,
            initialValue: false,
          });

          if (!confirm) {
            console.log(chalk.yellow("\nCancelled\n"));
            return;
          }
        }

        const client = await getSynapseClient();
        await client.skill.delete(skillId);

        console.log(chalk.green(`\n✅ Skill ${skillId} deleted successfully!\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to delete skill:"), error);
        process.exit(1);
      }
    });
}

function createSkillsRecommendCommand(): Command {
  return new Command("recommend")
    .description("Get skill recommendations for a task")
    .argument("<task>", "Task description")
    .option("--agent <type>", "Preferred agent type")
    .option("--limit <n>", "Maximum number of recommendations", "5")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (task, options) => {
      try {
        const client = await getSynapseClient();

        console.log(chalk.blue(`\n🔍 Finding skills for: "${task}"\n`));

        const skills = await client.skill.recommend(task);

        const limited = skills.slice(0, parseInt(options.limit));

        if (limited.length === 0) {
          console.log(chalk.yellow("  No matching skills found.\n"));
          return;
        }

        if (options.output === "json") {
          console.log(JSON.stringify(limited, null, 2));
          return;
        }

        console.log(chalk.bold(`📚 Recommended Skills (${limited.length})\n`));

        limited.forEach((skill: any, i: number) => {
          const matchScore = ((skill as any).matchScore || 0.9 - i * 0.1).toFixed(2);
          const successColor = skill.successRate >= 80 ? chalk.green : skill.successRate >= 50 ? chalk.yellow : chalk.red;

          console.log(`  ${i + 1}. ${chalk.cyan(skill.title)} ${chalk.gray(`(score: ${matchScore})`)}`);
          console.log(`     ${skill.description}`);
          console.log(
            `     Success: ${successColor(`${skill.successRate.toFixed(1)}%`)} | ` +
            `Used: ${chalk.blue(skill.usageCount)} times`
          );
          console.log();
        });

        console.log(chalk.gray("  Use 'synapse skills create' to add new skills for this task.\n"));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to get recommendations:"), error);
      }
    });
}

function createSkillsImportCommand(): Command {
  return new Command("import")
    .description("Import skills from a file or URL")
    .argument("<source>", "File path or URL")
    .option("--format <format>", "Format: auto, json, yaml", "auto")
    .option("--merge", "Merge with existing skills (update if exists)")
    .action(async (source, options) => {
      try {
        let skills;

        if (source.startsWith("http://") || source.startsWith("https://")) {
          console.log(chalk.blue(`\n📥 Fetching skills from ${source}...`));
          const response = await fetch(source);
          const text = await response.text();

          if (options.format === "auto" || options.format === "json") {
            skills = JSON.parse(text);
          } else {
            console.log(chalk.yellow("YAML format not yet supported"));
            return;
          }
        } else {
          console.log(chalk.blue(`\n📥 Reading skills from ${source}...`));
          const fs = await import("node:fs");
          const content = fs.readFileSync(source, "utf-8");

          if (options.format === "auto" || options.format === "json") {
            skills = JSON.parse(content);
          } else {
            console.log(chalk.yellow("YAML format not yet supported"));
            return;
          }
        }

        if (!Array.isArray(skills)) {
          skills = [skills];
        }

        const client = await getSynapseClient();
        let imported = 0;
        let skipped = 0;

        for (const skill of skills) {
          try {
            if (options.merge) {
              await client.skill.update(skill.id, skill);
            } else {
              await client.skill.create(skill);
            }
            imported++;
          } catch {
            skipped++;
          }
        }

        console.log(chalk.green(`\n✅ Imported ${imported} skills`));
        if (skipped > 0) {
          console.log(chalk.yellow(`⚠️  Skipped ${skipped} skills (already exist)`));
        }
        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to import skills:"), error);
        process.exit(1);
      }
    });
}

function createSkillsExportCommand(): Command {
  return new Command("export")
    .description("Export skills to a file")
    .argument("[skill-ids...]", "Skill IDs to export (default: all)")
    .option("--output <file>", "Output file path")
    .option("--format <format>", "Format: json, yaml", "json")
    .option("--pretty", "Pretty print JSON")
    .action(async (skillIds, options) => {
      try {
        const client = await getSynapseClient();
        let skills;

        if (skillIds.length > 0) {
          skills = [];
          for (const id of skillIds) {
            const skill = await client.skill.get(id);
            skills.push(skill);
          }
        } else {
          skills = await client.skill.list();
        }

        let output: string;
        if (options.format === "json") {
          output = options.pretty
            ? JSON.stringify(skills, null, 2)
            : JSON.stringify(skills);
        } else {
          console.log(chalk.yellow("YAML format not yet supported"));
          return;
        }

        if (options.output) {
          const fs = await import("node:fs");
          fs.writeFileSync(options.output, output);
          console.log(chalk.green(`\n✅ Exported ${skills.length} skills to ${options.output}\n`));
        } else {
          console.log(output);
        }
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to export skills:"), error);
        process.exit(1);
      }
    });
}

export { createSkillsListCommand, createSkillsCreateCommand };
