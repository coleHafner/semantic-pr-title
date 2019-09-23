// Checks API example
// See: https://developer.github.com/v3/checks/ to learn more

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
	app.log('Semantic PR Title app loaded!');

	app.on([
	    'pull_request.opened',
	    'pull_request.reopened',
	    'check_run.rerequested',
	    'pull_request.edited',
	], async context => {
		let conclusion = 'failure',
			message = '';

		context.log.info('context', JSON.stringify(context, null, 2));
		const { payload } = context;
		const action = payload.action;

		let pr,
			head_sha,
			head_branch;

		switch (action) {
			case 'rerequested':
				const prs = payload.check_run.check_suite.pull_requests;
				pr = prs && prs.length ? prs[0] : null;
				head_sha = payload.check_run.check_suite.head_sha;
				head_branch = payload.check_run.check_suite.head_branch;
        			break;

			case 'reopened':
			case 'edited':
      			case 'opened':
				pr = payload.pull_request;
				head_sha = pr.head.sha;
				head_branch = pr.head.ref;
        			break;

			default:
				context.log.info(`action "${action}" not recognized.`);
        			break;
		}

		// -----------------------------------
		// start the check
		// -----------------------------------
		const check = (await context.github.checks.create(context.repo({
			name: 'Validate Title',
			head_branch,
			head_sha,
			status: 'in_progress',
			started_at: new Date(),
			output: {
				title: 'Checking PR title!',
				summary: 'Let\'s make sure the PR title is valid.'
			}
		}))).data;

		const {
			repo,
			owner,
		} = await context.repo();

		try {
			if (!pr) {
				throw new Error(`No PRs found for delivery #<a target="_blank" href="https://github.com/settings/apps/semantic-pr-title/advanced#${context.id}">${context.id}</a>.`);
			}

			let { title } = pr;

			if (!title) {
				const prQuery = {
					owner,
					repo,
					number: pr.number,
				};

				const fullPr = (await context.github.pullRequests.get(prQuery)).data;

				if (!fullPr) {
					throw new Error(`Error: could not find pull request for query "${JSON.stringify(prQuery, null, 2)}".`);
				}

				title = fullPr.title;
			}

			const config = await context.config('semantic-pr-title.yml', {
				REGEX: '(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\\([a-z0-9\\s]+\\))?(:\\s)([a-z0-9\\s]+)',
			});

			const regex = new RegExp(config.REGEX, 'i');
			context.log.info(`REGEX is "${config.REGEX}"`);
			message = `PR Title "${title}" does not match regex "${config.REGEX}".`;

			if (regex.test(title) === true) {
				conclusion = 'success';
				message = `PR title "${title}" is valid!`;
			}

			context.log(`message: ${message}`);
		} catch (err) {
			message = `${err}`;
			app.log.error(err);

		} finally {
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
					title: conclusion === 'success' ? 'Check succeeded!' : 'Check failed!',
					summary: message,
				}
			});
		}
	});
}
