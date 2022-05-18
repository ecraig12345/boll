import { ConfigDefinition, PackageMetaRule, PackageRule } from "./types";
import { ConfigRegistry } from "./config-registry";
import { Logger } from "./logger";
import { RuleRegistry } from "./rule-registry";
import { InstantiatedPackageMetaRule, InstantiatedPackageRule, RuleSet } from "./rule-set";
import { Suite } from "./suite";
import { IgnoredFiles } from "./ignore";
import { getRepoRoot } from "./git-utils";

export class Config {
  private configuration: ConfigDefinition = {};
  private ignoredFiles: IgnoredFiles = new IgnoredFiles({ root: getRepoRoot() });

  constructor(private configRegistry: ConfigRegistry, private ruleRegistry: RuleRegistry, private logger: Logger) {}

  async buildSuite(): Promise<Suite> {
    const suite = new Suite();
    suite.ruleSets = await this.loadRuleSets();
    return suite;
  }

  async loadRuleSets(): Promise<RuleSet[]> {
    const config = this.resolvedConfiguration();
    const gitIgnoredFiles = config.excludeGitControlledFiles ? await this.ignoredFiles.getIgnoredFiles() : [];
    return (config.ruleSets || []).map(ruleSetConfig => {
      let exclude = [...(ruleSetConfig.exclude || []), ...(config.exclude || []), ...gitIgnoredFiles];
      if (
        ruleSetConfig.name &&
        config.configuration &&
        config.configuration.ruleSets &&
        (config.configuration.ruleSets as any)[ruleSetConfig.name]
      ) {
        exclude = [...exclude, ...((config.configuration.ruleSets as any)[ruleSetConfig.name].exclude || [])];
      }
      const glob = ruleSetConfig.fileLocator;
      glob.exclude = exclude;
      glob.include = ruleSetConfig.include || [];
      const fileChecks = ((ruleSetConfig.checks && ruleSetConfig.checks.file) || []).map(check => {
        const optionsFromConfig =
          (config.configuration && config.configuration.rules && (config.configuration.rules as any)[check.rule]) || {};
        const options = { ...check.options, ...optionsFromConfig };
        const rule = this.ruleRegistry.get<PackageRule>(check.rule)(this.logger, options);
        return new InstantiatedPackageRule(rule.name, check.severity || "error", rule);
      });
      const metaChecks = ((ruleSetConfig.checks && ruleSetConfig.checks.meta) || []).map(check => {
        const optionsFromConfig =
          (config.configuration && config.configuration.rules && (config.configuration.rules as any)[check.rule]) || {};
        const options = { ...check.options, ...optionsFromConfig };
        const rule = this.ruleRegistry.get<PackageMetaRule>(check.rule)(this.logger, options);
        return new InstantiatedPackageMetaRule(rule.name, check.severity || "error", rule);
      });
      return new RuleSet(glob, fileChecks, metaChecks);
    });
  }

  load(def: ConfigDefinition) {
    this.configuration = def;
  }

  resolvedConfiguration(): ConfigDefinition {
    const parentConfiguration = this.resolveParentConfiguration(this.configuration.extends);
    const finalResult = this.mergeConfigurations(this.configuration, parentConfiguration);
    return finalResult;
  }

  resolveParentConfiguration(baseConfigName: string | null | undefined): ConfigDefinition {
    if (!baseConfigName) {
      return {};
    }
    const baseConfig = this.configRegistry.get(baseConfigName);
    const parentConfig = this.resolveParentConfiguration(baseConfig.extends);
    return this.mergeConfigurations(parentConfig, baseConfig);
  }

  private mergeConfigurations(
    parentConfiguration: ConfigDefinition,
    childConfiguration: ConfigDefinition
  ): ConfigDefinition {
    const obj: ConfigDefinition = {
      exclude: [...(parentConfiguration.exclude || []), ...(childConfiguration.exclude || [])],
      ruleSets: [...(parentConfiguration.ruleSets || []), ...(childConfiguration.ruleSets || [])],
      configuration: {
        rules: {
          ...parentConfiguration.configuration?.rules,
          ...childConfiguration.configuration?.rules
        },
        ruleSets: {
          ...parentConfiguration.configuration?.ruleSets,
          ...childConfiguration.configuration?.ruleSets
        }
      }
    };

    if (childConfiguration.name) {
      obj.name = childConfiguration.name;
    }

    return obj;
  }
}
