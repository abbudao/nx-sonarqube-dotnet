# @abbudao/nx-sonarqube-dotnet

## About

A Nx plugin that analyzes .NET projects using [SonarQube](https://www.sonarqube.org)
/ [SonarCloud](https://sonarcloud.io). 

Forked from [nx-sonarqube](https://github.com/koliveira15/nx-sonarqube)

## Usage

### Prerequisites

1. Nx workspace
2. SonarQube or Sonar Cloud instance
3. [SonarScanner for .NET](https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner-for-dotnet/) installed and accessible in PATH.

### Installation

1. Install the package:
   ```bash
   npm i -D @abbudao/nx-sonarqube-dotnet
   ```
2. Execute the configuration generator to setup sonar for a given project:
   ```bash
   npx nx g @abbudao/nx-sonarqube-dotnet:config
   ```
3. Execute the sonar target for the given project:
   ```bash
   npx nx sonar my-project
   ```
   or
   ```bash
   npx nx affected --target sonar --parallel 1
   ```
   **Note:** Due to limitations with the scanner, you cannot run more than one scan in parallel

## Authentication

Sonar can require authentication credentials. You can set these via environment variables using [Nrwl's Nx recipe](https://nx.dev/recipes/environment-variables/define-environment-variables)

**SONAR_LOGIN:** The authentication token or login of a SonarQube user with either Execute Analysis permission on the project or Global Execute Analysis permission

**SONAR_PASSWORD:** If you're using an authentication token, leave this blank. If you're using a login, this is the password that goes with your SONAR_LOGIN username

## Customization

Modify the executor options based on the configuration table below. These options are based on [Analysis Parameters](https://docs.sonarqube.org/latest/analysis/analysis-parameters/)

| Name               | Required | Description                                                                                                                                                    | Default               |
| ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| hostUrl            | Yes      | Sonar server URL                                                                                                                                               | http://localhost:9000 |
| projectKey         | Yes      | The project's unique key. Allowed characters are: letters, numbers, -, \_, . and :, with at least one non-digit.                                               |                       |
| branches           | No       | Include branch name in analysis                                                                                                                                | false                 |
| exclusions         | No       | Files to exclude from coverage                                                                                                                                 |                       |
| projectName        | No       | Name of the project that will be displayed on the web interface                                                                                                |                       |
| projectVersion     | No       | The project version                                                                                                                                            |                       |
| qualityGate        | No       | Forces the analysis step to poll the SonarQube instance and wait for the Quality Gate status                                                                   | true                  |
| qualityGateTimeout | No       | Sets the number of seconds that the scanner should wait for a report to be processed                                                                           | 300                   |
| skipImplicitDeps   | No       | Skips adding implicit dependencies to the project graph analysis                                                                                               | false                 |
| testInclusions     | No       | Comma-delimited list of test file path patterns to be included in analysis. When set, only test files matching the paths set here will be included in analysis | \*_/_.spec.ts         |
| verbose            | No       | Add more detail to both client and server-side analysis logs                                                                                                   | false                 |
| extra              | No       | A key value pair for any extra sonar variable that is not included in the list above                                                                           |                       |

In Addition, the plugin recognizes any environment variable that is prefixed by `SONAR` and will add it to the sonar executor variables. For example the environment variable `SONAR_LOG_LEVEL=DEBUG` will be recognized as `sonar.log.level=DEBUG`
