// Checks API example
// See: https://developer.github.com/v3/checks/ to learn more

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.log('pr-title-linter app loaded!');

  app.on(['check_suite.requested', 'check_run.rerequested'], async context => {
    let conclusion = 'failure',
      message = '';

    const {
      head_branch,
      head_sha,
      pull_requests,
    } = context.payload.check_suite;

    if (!pull_requests || !pull_requests.length) {
      context.log('No PRs found. Bailing.')
      return;
    }

    // -----------------------------------
    // start the check
    // -----------------------------------
    const check = (await context.github.checks.create(context.repo({
      name: 'pr-title-linter',
      head_branch,
      head_sha,
      status: 'in_progress',
      started_at: new Date(),
      output: {
        title: 'Checking PR title!',
        summary: 'Let\'s make sure the PR title complies with commit-lint rules.'
      }
    }))).data;

    const {
      repo,
      owner,
    } = await context.repo();

    try {
      const prQuery = {
        owner,
        repo,
        number: pull_requests[0].number,
      };
      
      const pr = (await context.github.pullRequests.get(prQuery)).data;
      
      if (!pr) {
        throw new Error(`Error: could not find pull request for query "${JSON.stringify(prQuery)}".`);
      }
      
      const config = await context.config('pr-title-linter.yml', {
        REGEX: '(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\\([a-z0-9\\s]+\\))?(:\\s)([a-z0-9\\s]+)',
      });
      
      const regex = new RegExp(config.REGEX, 'i');
      context.log.info(`REGEX is "${config.REGEX}"`);
      
      if (typeof pr.title === 'undefined') {
        throw new Error(`No title found for PR #${JSON.stringify(prQuery)}`);
      }
      
      message = `PR Title "${pr.title}" does not match regex "${config.REGEX}".`;

      if (regex.test(pr.title) === true) {
        conclusion = 'success';
        message = `PR title "${pr.title}" is VALID! Well done.`;
      }

      context.log(`message: ${message}`);
    }catch (err) {
      app.log.error(err);

    }finally {
      // -----------------------------------
      // update check
      // -----------------------------------
      return context.github.checks.update({
        repo,
        owner,
        check_run_id: check.id,
        status: 'completed',
        completed_at: new Date(),
        conclusion,
        output: {
          title: 'Check complete!',
          summary: message,
        }
      });
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
