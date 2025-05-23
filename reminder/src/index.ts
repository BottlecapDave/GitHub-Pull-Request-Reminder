import { GitHubService } from "./githubService";
import { SlackService } from "./notifiers/slackService";
import { IReminderRequest, ReminderService } from "./reminderService";

async function run() {
    const mandatoryLabelsString = (process.env.GITHUB_MANDATORY_LABELS?.trim() || "");
    const excludedLabelsString = (process.env.GITHUB_EXCLUDED_LABELS?.trim() || "");
    
    const config: IReminderRequest = {
        githubAccessToken: process.env.GITHUB_ACCESS_TOKEN?.trim() as string,
        repos: (process.env.GITHUB_REPOS?.trim() || "").split(','),
        includeWorkInProgress: process.env.INCLUDE_WIP?.trim() !== "false",
        includeDraft: process.env.INCLUDE_DRAFT?.trim() !== "false",
        mandatoryLabels: mandatoryLabelsString.length > 0 ? mandatoryLabelsString.split(',') : [],
        excludedLabels: excludedLabelsString.length > 0 ? excludedLabelsString.split(',') : [],
        slack: {
            webhookUrl: process.env.SLACK_WEBHOOK_URL?.trim() as string,
            target: process.env.SLACK_TARGET?.trim() as string || '@here'
        }
    };

    if (!config.githubAccessToken) {
        throw new Error(`GITHUB_ACCESS_TOKEN was not specified`);
    } else if (!config.repos) {
        throw new Error(`GITHUB_REPOS was not specified`);
    } else if (config.includeWorkInProgress == null) {
        throw new Error(`INCLUDE_WIP was not specified`);
    } else if (config.includeDraft == null) {
        throw new Error(`INCLUDE_DRAFT was not specified`);
    } else if (!config.slack.webhookUrl) {
        throw new Error(`SLACK_WEBHOOK_URL was not specified`);
    } else if (!config.slack.target) {
        throw new Error(`SLACK_TARGET was not specified`);
    }

    const slackService = new SlackService();
    const githubService = new GitHubService();
    const reminderService = new ReminderService(githubService, slackService);

    return reminderService.sendReminder(config);
}

run().catch(err => {
    console.error('ERROR', err);
    process.exit(-1);
});
