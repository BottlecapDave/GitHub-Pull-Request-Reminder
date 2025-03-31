import { GitHubService } from "./githubService";
import { MsTeamsService } from "./notifiers/msTeamsService";
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
        slack: process.env.SLACK_WEBHOOK_URL || process.env.SLACK_TARGET ?
        {
            webhookUrl: process.env.SLACK_WEBHOOK_URL?.trim() as string,
            target: process.env.SLACK_TARGET?.trim() as string || '@here'
        } : undefined,
        msTeams: process.env.MS_TEAMS_WEBHOOK_URL ?
        {
            webhookUrl: process.env.MS_TEAMS_WEBHOOK_URL?.trim() as string,
        } : undefined,
    };

    if (!config.githubAccessToken) {
        throw new Error(`GITHUB_ACCESS_TOKEN was not specified`);
    } else if (!config.repos) {
        throw new Error(`GITHUB_REPOS was not specified`);
    } else if (config.includeWorkInProgress == null) {
        throw new Error(`INCLUDE_WIP was not specified`);
    } else if (config.includeDraft == null) {
        throw new Error(`INCLUDE_DRAFT was not specified`);
    } 
    
    if (config.slack)
    {
        if (!config.slack.webhookUrl) {
            throw new Error(`SLACK_WEBHOOK_URL was not specified`);
        } else if (!config.slack.target) {
            throw new Error(`SLACK_TARGET was not specified`);
        }
    }
    else if (config.msTeams)
    {
        if (!config.msTeams.webhookUrl) {
            throw new Error(`MS_TEAMS_WEBHOOK_URL was not specified`);
        }
    }
    else
    {
        throw new Error('Either Slack or MS Teams configuration must be specified');
    }

    const slackService = new SlackService();
    const msTeamsService = new MsTeamsService();
    const gitlabService = new GitHubService();
    const reminderService = new ReminderService(gitlabService, slackService, msTeamsService);

    return reminderService.sendReminder(config);
}

run().catch(err => {
    console.error('ERROR', err);
    process.exit(-1);
});
