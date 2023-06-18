import { ScanExecutorSchema } from '../schema';

import { DependencyType, ExecutorContext, logger } from '@nx/devkit';
import { execSync } from 'child_process';
import { TargetConfiguration } from 'nx/src/config/workspace-json-project-json';
interface OptionMarshaller {
  Options(): { [option: string]: string };
}

export declare type WorkspaceLibrary = {
  name: string;
  type: DependencyType | string;
  sourceRoot: string;
  testTarget?: TargetConfiguration;
};
class ExtraMarshaller implements OptionMarshaller {
  private readonly options: { [option: string]: string };
  constructor(options: { [option: string]: string }) {
    this.options = options;
  }
  Options(): { [p: string]: string } {
    return this.options;
  }
}
class EnvMarshaller implements OptionMarshaller {
  Options(): { [p: string]: string } {
    return Object.keys(process.env)
      .filter((e) => e.startsWith('SONAR'))
      .reduce((option, env) => {
        let sonarEnv = env.toLowerCase();
        sonarEnv = sonarEnv.replace(/_/g, '.');
        option[sonarEnv] = process.env[env];
        return option;
      }, {});
  }
}

// Format options as described in https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner-for-dotnet/
function toDotnetSonarOption(options): string {
  const newOptions = Object.keys(options)
    .filter((k) => options[k] !== undefined && options[k] !== '')
    .map((key) => `/d:"${key}=${options[key]}"`);
  return newOptions.join(' ');
}

export async function scanner(
  options: ScanExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  if (!options.qualityGate) logger.warn(`Skipping quality gate check`);

  let branch = '';
  if (options.branches) {
    branch = execSync('git rev-parse --abbrev-ref HEAD').toString();
  }

  const scannerOptions = getScannerOptions(options, branch);
  const login = process.env.SONAR_LOGIN;
  const dotnetOptions = toDotnetSonarOption(scannerOptions);

  const dotnetProjectKey = `/k:"${options.projectKey}"`;
  const rootSource = context.workspace.projects[context.projectName].sourceRoot;
  logger.info(
    execSync(
      `dotnet sonarscanner begin ${dotnetProjectKey} ${dotnetOptions}`
    ).toString()
  );
  logger.info(execSync(`dotnet restore ${rootSource}`).toString());
  logger.info(execSync(`dotnet build ${rootSource}`).toString());
  logger.info(
    execSync(`dotnet sonarscanner end /d:sonar.login="${login}"`).toString()
  );

  return { success: true };
}
export function getScannerOptions(
  options: ScanExecutorSchema,
  branch: string
): { [option: string]: string } {
  let scannerOptions: { [option: string]: string } = {
    'sonar.host.url': options.hostUrl,
    'sonar.exclusions': options.exclusions,
    'sonar.language': 'cs',
    'sonar.qualitygate.timeout': options.qualityGateTimeout,
    'sonar.qualitygate.wait': String(options.qualityGate),
    'sonar.scm.provider': 'git',
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.verbose': String(options.verbose),
    'sonar.test.inclusions': options.testInclusions,
  };
  if (options.branches) {
    scannerOptions['sonar.branch.name'] = branch;
  }
  scannerOptions = combineOptions(
    new ExtraMarshaller(options.extra),
    new EnvMarshaller(),
    scannerOptions
  );
  return scannerOptions;
}

function combineOptions(
  extraOptions: ExtraMarshaller,
  envOptions: EnvMarshaller,
  scannerOptions: { [option: string]: string }
): { [option: string]: string } {
  return {
    ...extraOptions.Options(),
    ...scannerOptions,
    ...envOptions.Options(),
  };
}
