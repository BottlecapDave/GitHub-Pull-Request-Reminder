import { IGitHubMergeRequestRequest, GitHubService } from "./githubService";
import { ISlackConfig, SlackService } from "./notifiers/slackService";

export interface IReminderRequest extends IGitHubMergeRequestRequest {
    githubAccessToken: string;
    slack: ISlackConfig;
}

export class ReminderService {
    constructor(private githubService: GitHubService, private slackService: SlackService) {}
    
    async sendReminder(request: IReminderRequest) {
        const mergeRequests = await this.githubService.getMergeRequests(request.githubAccessToken, request);
    
        if (mergeRequests.length > 0) {
            await this.slackService.sendReminder(request.slack, mergeRequests);
        }
    }
}