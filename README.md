# Semantic PR Title

> A GitHub App built with [Probot](https://github.com/probot/probot) that enforces your PR title to match a user defined regex.

## Config
Add a file @ `.github/semantic-pr-title.yml` with the following:

```
REGEX: <your regex here>
```
The default regex enforces the [angular commit convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines) (first line) on your PR title: `(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\\([a-z0-9\\s]+\\))?(:\\s)([a-z0-9\\s]+)`

Note that the regex is a string and `\` must be escaped. 


## Setup

```sh
# Install dependencies
npm ci

# Run the bot
npm run dev
```

## Usage
This is currently [hosted on Glitch](https://colehafner-pr-title-linter-1.glitch.me) and used internally. It has not been released into the [GitHub Marketplace](https://github.com/marketplace?type=apps) or [Probot 'Featured Apps' Page](https://probot.github.io/apps/) yet.

## Contributing

If you have suggestions for how pr-title-linter could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Cole Hafner (https://colehafner.com)
